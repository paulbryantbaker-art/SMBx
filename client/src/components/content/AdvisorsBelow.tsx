interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  return (
    <div>
      {/* ═══ Section 1: THE OFFER ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            Three deals. Completely free. Then decide.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">We don&apos;t ask you to subscribe to something you haven&apos;t tried. We don&apos;t demo it in a sales call. We let you use it.</p>
            <p className="m-0">Run three complete client journeys through smbX.ai &mdash; valuations, CIMs, market reports, buyer qualification, the whole thing &mdash; free. White-label everything.</p>
            <p className="m-0">After three journeys, it works like everyone else&apos;s wallet: fund as you go, spend per deliverable. No per-seat licensing.</p>
            <p className="m-0 text-[#1A1A18] font-bold">An advisor who sees Yulia generate a CIM in 30 minutes vs. 3 weeks doesn&apos;t need a sales pitch.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: WHAT CHANGES FOR YOU ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10" style={{ letterSpacing: '-0.04em' }}>
            68 hours back. Every month.
          </h2>
          <div className="space-y-10">
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">LISTING PREP &mdash; 30 minutes, not 12 hours</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                Financials &rarr; normalized &rarr; add-backs &rarr; valuation &rarr; CIM. You review. You refine. You present under your brand.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">BUYER QUALIFICATION &mdash; seconds, not hours</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                SBA eligible? Down payment sufficient? DSCR in range? Know before your first call.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">BUY MANDATE INTELLIGENCE</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                Client wants to acquire. Yulia maps the market landscape and evaluates opportunities against the thesis.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">WHITE-LABEL EVERYTHING</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                Your clients see your deliverables. They don&apos;t know the smbX.ai Engine built the analytical foundation.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">DEALS YOU&apos;D OTHERWISE TURN AWAY</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                $800K landscaping company. $1.2M cleaning service. Profitable now.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: THE MATH ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10 md:text-center" style={{ letterSpacing: '-0.04em' }}>
            You know the bottleneck. Here&apos;s what changes.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without */}
            <div className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#6E6A63] mb-4 block">WITHOUT SMBX.AI</span>
              <div className="space-y-3 text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Hours on data/docs</span><span className="text-[#1A1A18] font-bold">~80 hrs/mo</span></div>
                <div className="flex justify-between"><span>Deals turned away</span><span className="text-[#1A1A18] font-bold">3&ndash;4/mo</span></div>
              </div>
            </div>
            {/* With */}
            <div className="bg-[#D4714E] text-white p-8" style={{ borderRadius: '32px' }}>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-orange-100 mb-4 block">WITH SMBX.AI</span>
              <div className="space-y-3 text-[15px] font-medium text-orange-100" style={{ lineHeight: 1.5 }}>
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
            Shape the product. Grow with us.
          </h2>
          <div className="max-w-3xl space-y-4 mt-10 mb-10">
            {[
              { tier: 'Verified Advisor', desc: 'Directory listing + platform matching' },
              { tier: 'Premier Partner', desc: 'Volume pricing + priority matching' },
              { tier: 'Elite Partner', desc: 'Custom integrations + product roadmap' },
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
