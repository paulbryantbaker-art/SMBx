interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  return (
    <div>
      {/* ═══ Section 1: YOUR BOTTLENECK ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            You&apos;re not selling time. You&apos;re selling expertise. But time is what you run out of.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">Every listing: 8&ndash;12 hours of financial normalization, comp research, CIM drafting, marketing materials. Every buyer inquiry: 2&ndash;4 hours of verification and fit assessment. Multiply by your active deal count.</p>
            <p className="m-0">You&apos;re spending 60% of your week on analysis and documents &mdash; work that doesn&apos;t need your relationships, your judgment, or your negotiation instincts. But it needs someone&apos;s time.</p>
            <p className="m-0 text-[#1A1A18] font-bold">Yulia does it in minutes. Same quality. Same rigor. You get your week back to do what actually earns your fee.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: YOUR NEW TOOLKIT ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 className="text-[36px] md:text-[48px] font-extrabold" style={{ letterSpacing: '-0.04em' }}>
              Everything that eats your week. Automated.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '\uD83D\uDCE6', title: 'LISTING PREP \u2014 Minutes, not days', body: 'Tell Yulia about the business. She normalizes financials, identifies add-backs, runs the valuation, benchmarks the market, drafts the CIM. You review, refine, present.' },
              { icon: '\uD83D\uDC64', title: 'BUYER QUALIFICATION \u2014 Seconds, not hours', body: 'Buyer reaches out. Tell Yulia their profile. SBA eligible? Down payment sufficient? DSCR in range? Know if they can close before your first meeting.' },
              { icon: '\uD83D\uDCCA', title: 'WHITE-LABEL EVERYTHING', body: 'Every deliverable under YOUR brand. Your clients see your work. They don\u2019t know the smbX.ai Engine built the analytical foundation. They just know you delivered institutional quality, fast.' },
              { icon: '\uD83D\uDDFA\uFE0F', title: 'MARKET INTELLIGENCE FOR BUY MANDATES', body: 'Client wants to acquire. Tell Yulia the criteria. She maps the competitive landscape, analyzes market dynamics, and evaluates any opportunity against the thesis \u2014 so when your client asks \u201Cshould I pursue this?\u201D the answer is ready.' },
            ].map(f => (
              <div key={f.title} className="bg-[#F9FAFB] p-8 md:p-10" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                <span className="text-[28px] block mb-3">{f.icon}</span>
                <h3 className="text-[18px] font-extrabold mb-3">{f.title}</h3>
                <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
          {/* Small deals callout */}
          <div className="mt-6 bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
            <div className="flex items-start gap-3">
              <span className="text-[28px] shrink-0">{'\uD83D\uDCB0'}</span>
              <div>
                <h3 className="text-[18px] font-extrabold mb-2">DEALS YOU&apos;D OTHERWISE TURN AWAY</h3>
                <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>
                  $800K landscaping company. $1.2M cleaning service. When Yulia handles the intelligence layer, the deals where fees don&apos;t justify 40 hours become profitable. More clients. More deals. More revenue per engagement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: THE MATH ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10 md:text-center" style={{ letterSpacing: '-0.04em' }}>
            68 hours back. Every month.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without */}
            <div className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#6E6A63] mb-4 block">WITHOUT SMBX.AI</span>
              <div className="space-y-3 text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Time per listing</span><span className="text-[#1A1A18] font-bold">8&ndash;12 hours</span></div>
                <div className="flex justify-between"><span>Hours on data/docs</span><span className="text-[#1A1A18] font-bold">~80 hrs/mo</span></div>
                <div className="flex justify-between"><span>Deals turned away</span><span className="text-[#1A1A18] font-bold">3&ndash;4/mo</span></div>
              </div>
            </div>
            {/* With */}
            <div className="bg-[#D4714E] text-white p-8" style={{ borderRadius: '32px' }}>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-orange-100 mb-4 block">WITH SMBX.AI</span>
              <div className="space-y-3 text-[15px] font-medium text-orange-100" style={{ lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Time per listing</span><span className="text-white font-bold">30 min + review</span></div>
                <div className="flex justify-between"><span>Hours on data/docs</span><span className="text-white font-bold">~12 hrs/mo</span></div>
                <div className="flex justify-between"><span>Deals turned away</span><span className="text-white font-bold">0</span></div>
              </div>
              <div className="border-t border-orange-300/30 mt-5 pt-5">
                <p className="text-[16px] font-bold text-white m-0">= 68 hours reclaimed</p>
                <p className="text-[16px] font-bold text-white m-0 mt-1">= 4&ndash;6 more deals per month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: PARTNERSHIP ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-4" style={{ letterSpacing: '-0.04em' }}>
            We built this for you. Help us make it better.
          </h2>
          <div className="max-w-3xl space-y-4 mt-10 mb-10">
            {[
              { tier: 'Verified Advisor', desc: 'Listed in the smbX.ai directory. Matched with platform users who need representation.' },
              { tier: 'Premier Partner', desc: 'Volume pricing. Priority matching. Co-branded capabilities.' },
              { tier: 'Elite Partner', desc: 'Custom integrations. Dedicated support. Early access. Product roadmap influence.' },
            ].map(t => (
              <div key={t.tier} className="bg-[#F9FAFB] px-6 py-4" style={{ borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                <h4 className="text-[16px] font-bold text-[#1A1A18] m-0 mb-1">{t.tier}</h4>
                <p className="text-[14px] text-[#6E6A63] m-0">{t.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onChipClick("I'm an advisor \u2014 tell me about partnerships")}
            className="bg-[#1A1A18] text-white text-[14px] font-bold px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#333] transition-colors"
            style={{ fontFamily: 'inherit' }}
            type="button"
          >
            Talk to us about partnerships &rarr;
          </button>
        </div>
      </section>

      <footer className="text-center py-24 mt-32">
        <span className="text-[18px] font-extrabold">smb<span className="text-[#D4714E]">X</span>.ai</span>
        <p className="text-[12px] font-medium text-[#9CA3AF] mt-1 m-0" style={{ letterSpacing: '0.1em' }}>
          Deal Intelligence Infrastructure
        </p>
      </footer>
    </div>
  );
}
