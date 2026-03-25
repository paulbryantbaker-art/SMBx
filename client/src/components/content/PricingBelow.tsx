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
  const borderColor = dark ? 'border-zinc-800' : 'border-[#eeeef0]';
  const darkPanel = dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]';
  const sliderTrack = dark ? '#3a3c3e' : '#e8e8ea';

  // Calculator logic
  const sde = sdeK * 1000;
  const rawFee = sde * 0.001;
  const fee = Math.max(999, Math.round(rawFee));
  const pct = ((sdeK - 100) / (50000 - 100)) * 100;

  const feeContext = fee <= 999
    ? 'Minimum fee. Everything included.'
    : 'One time. Everything through close + 180 days.';

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
    { icon: 'chat', title: 'Yulia', desc: 'Unlimited conversation. Ask anything about your deal, your industry, your market. Free forever.' },
    { icon: 'monitoring', title: 'ValueLens', desc: 'Preliminary valuation range with market context. Updated as your financials sharpen. The number you came here for.' },
    { icon: 'checklist', title: 'First 2 Gates', desc: 'Profile, financial normalization, add-back identification, preliminary SDE/EBITDA — everything through Gate 1.' },
  ];

  const freeSmall = [
    { title: 'Value Readiness', desc: '7-factor score + improvement actions' },
    { title: 'Buyer Thesis', desc: 'Acquisition blueprint + SBA eligibility' },
    { title: 'Capital Stack', desc: 'Funding structure template' },
    { title: 'Market Context', desc: 'Industry heat + local data' },
  ];

  const included = [
    { icon: 'description', title: 'Professional deal documents', desc: 'CIM, pitch deck, LOI, deal memos — generated from your verified financials and adapted to your league.' },
    { icon: 'speed', title: 'Defensible valuation', desc: 'Multi-methodology valuation with sourced comparables, growth premiums, and risk discounts. Built to survive buyer scrutiny.' },
    { icon: 'account_balance_wallet', title: 'Financial modeling', desc: 'SBA qualification, DSCR analysis, acquisition models, sensitivity analysis — all from deterministic engines, not AI estimates.' },
    { icon: 'gavel', title: 'Negotiation strategy', desc: 'League-specific tactics, deal structure analysis, working capital mechanisms — coaching for both sides of the table.' },
    { icon: 'fact_check', title: 'Due diligence coordination', desc: 'DD checklists, risk summaries, QoE preparation — organized by gate with completion tracking.' },
    { icon: 'merge', title: '180-day integration', desc: 'Post-close value creation plan built from what due diligence actually revealed. Not a template — a plan built from your deal.' },
  ];

  const steps = [
    { num: '1', title: 'You describe your business', desc: 'Industry, revenue, location — plain language', green: true },
    { num: '2', title: 'Yulia normalizes your financials', desc: 'Add-backs identified, SDE/EBITDA calculated', green: true },
    { num: '3', title: 'She shows you the range', desc: 'Preliminary valuation with market context — free', green: true },
    { num: '4', title: 'Your fee appears', desc: '"Your execution fee is $X — want to continue?"', green: false },
    { num: '5', title: 'Everything unlocks', desc: 'Full valuation, documents, negotiation, close + 180 days', green: false },
  ];

  const faqs = [
    { q: 'What counts as my SDE or EBITDA?', a: 'The adjusted number Yulia calculates with you — after add-backs are identified and verified. Not the number on your tax return. The real one.' },
    { q: 'When do I pay?', a: "After Yulia has calculated your SDE/EBITDA and shown you a preliminary valuation range — all for free. The fee appears at the natural moment when you're ready for the full analysis. No surprise charges." },
    { q: "What if my deal doesn't close?", a: 'Your fee covers the entire journey — valuation, documents, negotiation coaching, closing coordination — regardless of outcome. There are no success fees. No close fees. Ever.' },
    { q: "What if I'm a buyer?", a: "Same formula. Your fee is based on the target company's EBITDA (or SDE for smaller deals) once Yulia has enough data to calculate it. Thesis development, deal sourcing, and initial screening are free." },
    { q: 'How does this compare to a traditional advisor?', a: "A traditional M&A advisor charges 8–12% of deal value on a success fee, plus monthly retainers of $5K–$15K. For a $2M deal, that's $160K–$240K. Your smbX fee for the same deal: $999. We're not replacing your advisor — we're making sure you're prepared before you hire one." },
    { q: 'Is there a maximum fee?', a: "No cap. At $50M EBITDA, the fee is $50,000 — still a fraction of what institutional advisory costs for deals at that scale. The methodology scales with your deal's complexity." },
  ];

  const advisorPlans = [
    { name: 'Trial', price: '$0', sub: '', desc: 'First 3 client deals' },
    { name: 'Pro', price: '$199', sub: '/mo', desc: 'Unlimited clients' },
    { name: 'Enterprise', price: '$399', sub: '/mo', desc: 'Teams + API + white-label' },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <style>{`
        .smbx-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:8px;outline:none;cursor:pointer}
        .smbx-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;border-radius:50%;background:#b0004a;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer}
        .smbx-range::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#b0004a;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer}
      `}</style>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-5xl mx-auto">

        {/* ═══ 1. HERO — celebrate simplicity ═══ */}
        <section className="mb-20 text-center max-w-3xl mx-auto">
          <ScrollReveal>
            <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-black uppercase tracking-[0.2em] mb-6 rounded-sm">Pricing</span>
          </ScrollReveal>
          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
              One formula.<br />No surprises.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className={`text-xl leading-relaxed max-w-xl mx-auto ${muted}`}>
              0.1% of your SDE or EBITDA. One time. Everything included through close — plus 180 days after.
            </p>
          </ScrollReveal>
        </section>

        {/* ═══ 2. THE FORMULA — big, bold, unmissable ═══ */}
        <section className="mb-20">
          <ScrollReveal>
            <div className={`${darkPanel} rounded-3xl p-10 md:p-16 text-center text-white`}>
              <div className="max-w-2xl mx-auto">
                <p className="text-[#dadadc]/40 uppercase text-xs tracking-[0.3em] font-bold mb-8">Your execution fee</p>
                <div className="text-6xl md:text-8xl font-black tracking-tighter mb-3 font-headline">
                  0.1<span className="text-[#b0004a]">%</span>
                </div>
                <p className="text-xl text-[#dadadc]/60 mb-10">of your SDE or EBITDA · $999 minimum · one time per deal</p>
                <div className="grid grid-cols-3 gap-4 text-center max-w-lg mx-auto">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-2xl font-black text-[#b0004a]">$999</p>
                    <p className="text-[10px] text-[#dadadc]/40 mt-1">$999K SDE</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-2xl font-black text-white">$2,500</p>
                    <p className="text-[10px] text-[#dadadc]/40 mt-1">$2.5M EBITDA</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-2xl font-black text-white">$10,000</p>
                    <p className="text-[10px] text-[#dadadc]/40 mt-1">$10M EBITDA</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 3. CALCULATOR — interactive slider ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className={`${card} rounded-3xl p-8 md:p-12 max-w-2xl mx-auto`}>
              <h2 className="font-headline text-2xl font-black tracking-tight text-center mb-2">What's your fee?</h2>
              <p className={`text-sm text-center mb-10 ${muted}`}>Slide to your SDE or EBITDA. That's it.</p>

              <div className="mb-8">
                <div className="flex justify-between items-baseline mb-3">
                  <label className={`text-sm font-bold ${muted}`}>SDE / EBITDA</label>
                  <span className="text-3xl font-black tracking-tight">{formatK(sdeK)}</span>
                </div>
                <input
                  type="range"
                  className="smbx-range w-full"
                  min={100}
                  max={50000}
                  step={50}
                  value={sdeK}
                  onChange={(e) => setSdeK(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right, #b0004a ${pct}%, ${sliderTrack} ${pct}%)` }}
                />
                <div className="flex justify-between mt-2">
                  <span className={`text-[10px] ${muted}`}>$100K</span>
                  <span className={`text-[10px] ${muted}`}>$50M</span>
                </div>
              </div>

              <div className={`${subtleBg} rounded-2xl p-8 text-center`}>
                <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${muted}`}>Your execution fee</p>
                <p className="text-5xl font-black tracking-tight text-[#b0004a] mb-3">{formatFee(fee)}</p>
                <p className={`text-sm ${muted}`}>{feeContext}</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-center p-4">
                  <p className={`text-[10px] uppercase font-bold mb-1 ${muted}`}>Traditional advisor</p>
                  <p className={`text-2xl font-black line-through ${dark ? 'text-[#dadadc]/30' : 'text-[#5d5e61]/40'}`}>
                    {formatK(advisorLow)}–{formatK(advisorHigh)}
                  </p>
                </div>
                <div className="text-center p-4">
                  <p className="text-[10px] text-[#b0004a] uppercase font-bold mb-1">smbX.ai</p>
                  <p className="text-2xl font-black text-[#b0004a]">{formatFee(fee)}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 4. WHAT'S FREE ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">Start for free. Seriously.</h2>
              <p className={`text-lg max-w-xl mx-auto ${muted}`}>
                Everything through your first two gates is free — including a preliminary valuation range. No credit card. No account required. Keep everything Yulia finds.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {freeCards.map((c) => (
              <StaggerItem key={c.title}>
                <div className={`${card} rounded-2xl p-8 text-center hover:shadow-lg transition-all`}>
                  <div className="w-14 h-14 rounded-2xl bg-[#006630]/10 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[#006630] text-2xl">{c.icon}</span>
                  </div>
                  <h3 className="font-black mb-2">{c.title}</h3>
                  <p className={`text-sm ${muted}`}>{c.desc}</p>
                  <p className="text-xs text-[#006630] font-bold mt-4">Always free</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6">
            {freeSmall.map((s) => (
              <StaggerItem key={s.title}>
                <div className={`${card} rounded-xl p-5 text-center`}>
                  <h4 className="font-bold text-sm mb-1">{s.title}</h4>
                  <p className={`text-[10px] ${muted}`}>{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 5. WHAT'S INCLUDED ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl font-black tracking-tight mb-4">One fee. <span className="text-[#b0004a]">Everything.</span></h2>
              <p className={`text-lg max-w-xl mx-auto ${muted}`}>
                Your execution fee unlocks every gate, every document, and every analysis through close — plus 180 days of post-close integration support.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {included.map((c) => (
              <StaggerItem key={c.title}>
                <div className={`${card} rounded-2xl p-6`}>
                  <span className="material-symbols-outlined text-[#b0004a] text-2xl mb-3">{c.icon}</span>
                  <h3 className="font-bold mb-2">{c.title}</h3>
                  <p className={`text-sm ${muted}`}>{c.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 6. THE NATURAL PAYWALL ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <div className={`${card} rounded-3xl p-8 md:p-12`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div>
                    <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">How It Happens</span>
                    <h2 className="font-headline text-3xl font-black tracking-tight mb-6">The price reveals itself naturally.</h2>
                    <div className={`space-y-4 text-sm leading-relaxed ${muted}`}>
                      <p>You tell Yulia about your business. She asks smart follow-ups. She normalizes your financials and identifies add-backs you missed.</p>
                      <p>At the moment she calculates your SDE or EBITDA — the same moment she can give you a real valuation — she tells you your fee.</p>
                      <p>It's a discovery, not a gate. And by then, she's already shown you enough value that the fee feels like an obvious next step.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {steps.map((s) => (
                      <div key={s.num} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${s.green ? 'bg-[#006630]/10 text-[#006630]' : 'bg-[#b0004a]/10 text-[#b0004a]'}`}>
                          {s.num}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{s.title}</p>
                          <p className={`text-[10px] ${muted}`}>{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 7. FOR ADVISORS ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-[#b0004a] font-bold uppercase tracking-widest text-xs block mb-3">For Advisors & Brokers</span>
              <h2 className="font-headline text-3xl font-black tracking-tight mb-4">Your first 3 client deals are free.</h2>
              <p className={`text-lg mb-8 max-w-xl mx-auto ${muted}`}>
                Full platform access. Full document generation. Full methodology. No time limit, no feature gates. If you like it, monthly plans start at $199.
              </p>
              <div className="inline-flex gap-4 flex-wrap justify-center">
                {advisorPlans.map((plan) => (
                  <div key={plan.name} className={`${card} rounded-2xl p-6 text-left min-w-[200px]`}>
                    <h4 className="font-black text-lg mb-1">{plan.name}</h4>
                    <p className="text-3xl font-black">
                      {plan.price}
                      {plan.sub && <span className={`text-sm font-medium ${muted}`}>{plan.sub}</span>}
                    </p>
                    <p className={`text-xs ${muted}`}>{plan.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 8. FAQ ═══ */}
        <section className="mb-24 max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="font-headline text-3xl font-black text-center mb-10">Questions</h2>
          </ScrollReveal>
          <StaggerContainer className="space-y-6">
            {faqs.map((faq, i) => (
              <StaggerItem key={faq.q}>
                <div className={`${i < faqs.length - 1 ? `border-b ${borderColor}` : ''} pb-6`}>
                  <h4 className="font-bold mb-2">{faq.q}</h4>
                  <p className={`text-sm ${muted}`}>{faq.a}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 9. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 text-center max-w-3xl mx-auto">
            <div className={`${subtleBg} py-16 px-10 rounded-3xl`}>
              <h2 className="font-headline text-4xl font-black tracking-tighter mb-4">Free until you see the value.</h2>
              <p className={`text-lg mb-8 ${muted}`}>Tell Yulia about your deal. Keep everything she finds. Pay only when you're ready for the full journey.</p>
              <button
                onClick={handleCTA}
                className="px-10 py-5 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
              >
                Talk to Yulia
              </button>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
