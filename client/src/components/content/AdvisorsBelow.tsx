interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  return (
    <div>
      {/* ═══ Section 1: THE TIME PROBLEM ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">THE ADVISOR&apos;S BOTTLENECK</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-8" style={{ letterSpacing: '-0.04em' }}>
            You&apos;re not selling time. You&apos;re selling expertise.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0 text-[#1A1A18] font-bold">But time is what you run out of.</p>
            <p className="m-0">Every new listing: 8&ndash;12 hours to normalize financials, research comps, draft the CIM, prepare the teaser, and build the marketing package. Every buyer inquiry: 2&ndash;4 hours to verify finances, check SBA eligibility, and assess fit.</p>
            <p className="m-0">Multiply that by 8 active listings and 15 buyer inquiries a month.</p>
            <p className="m-0">You&apos;re spending 60% of your time on data assembly and document production &mdash; work that doesn&apos;t require your expertise but absolutely requires someone&apos;s time.</p>
            <p className="m-0 text-[#1A1A18] font-bold">Yulia does it in minutes. The quality doesn&apos;t drop. The methodology doesn&apos;t change. The only thing that changes is you get your week back.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: WHAT YULIA DOES ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">YOUR NEW TOOLKIT</span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              Everything that eats your week. Automated.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '\uD83D\uDCE6', title: 'Listing Prep in Minutes', body: 'Tell Yulia about the business. She normalizes the financials, identifies add-backs, runs the valuation, benchmarks the market, and drafts a CIM \u2014 in the time it takes you to finish your coffee. You review. You refine. You present it under your brand.' },
              { icon: '\uD83D\uDC64', title: 'Instant Buyer Qualification', body: 'A buyer reaches out. Instead of spending 2 hours on the phone verifying finances: tell Yulia the buyer\u2019s profile. She models SBA eligibility, calculates required down payment, runs DSCR, and tells you if this buyer can actually close \u2014 before your first meeting.' },
              { icon: '\uD83D\uDCCA', title: 'White-Label Everything', body: 'Every deliverable Yulia generates can be presented under your brand. Valuations, CIMs, market reports, financing models \u2014 your clients see YOUR deliverables. They just know you delivered institutional-quality work, fast.' },
              { icon: '\uD83D\uDCB0', title: 'Serve Deals You\u2019d Otherwise Turn Away', body: 'That $800K landscaping company. That $1.2M cleaning service. The deals where the fees don\u2019t justify 40 hours of manual analysis. They become profitable when Yulia handles the intelligence layer. More clients. More deals. More revenue per engagement.' },
            ].map(f => (
              <div key={f.title} className="bg-[#F9FAFB] p-8 md:p-10" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                <span className="text-[28px] block mb-3">{f.icon}</span>
                <h3 className="text-[22px] font-extrabold mb-3">{f.title}</h3>
                <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 3: THE MATH ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10 md:text-center" style={{ letterSpacing: '-0.04em' }}>
            Let&apos;s do the math.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without */}
            <div className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#6E6A63] mb-4 block">WITHOUT SMBX.AI</span>
              <div className="space-y-3 text-[15px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Time per listing</span><span className="text-[#1A1A18] font-bold">8&ndash;12 hours</span></div>
                <div className="flex justify-between"><span>Listings per month</span><span className="text-[#1A1A18] font-bold">6&ndash;8</span></div>
                <div className="flex justify-between"><span>Hours on data/docs</span><span className="text-[#1A1A18] font-bold">~80 hrs/mo</span></div>
                <div className="flex justify-between"><span>Deals turned away</span><span className="text-[#1A1A18] font-bold">3&ndash;4/mo</span></div>
              </div>
            </div>
            {/* With */}
            <div className="bg-[#D4714E] text-white p-8" style={{ borderRadius: '32px' }}>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-orange-100 mb-4 block">WITH SMBX.AI</span>
              <div className="space-y-3 text-[15px] font-medium text-orange-100" style={{ lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Time per listing</span><span className="text-white font-bold">30 min + review</span></div>
                <div className="flex justify-between"><span>Listings per month</span><span className="text-white font-bold">10&ndash;15</span></div>
                <div className="flex justify-between"><span>Hours on data/docs</span><span className="text-white font-bold">~12 hrs/mo</span></div>
                <div className="flex justify-between"><span>Deals turned away</span><span className="text-white font-bold">0</span></div>
              </div>
              <div className="border-t border-orange-300/30 mt-5 pt-5">
                <p className="text-[16px] font-bold text-white m-0">That&apos;s 68 hours back. Every month.</p>
                <p className="text-[16px] font-bold text-white m-0 mt-1">That&apos;s 4&ndash;6 more deals per month.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: THE PARTNERSHIP ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">ADVISOR NETWORK</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-8" style={{ letterSpacing: '-0.04em' }}>
            We&apos;re building the advisor network.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6 mb-10" style={{ lineHeight: 1.65 }}>
            <p className="m-0">smbX.ai is designed to make great advisors unstoppable &mdash; not to replace them. We&apos;re building a verified professional network with tiered partnership levels:</p>
          </div>
          <div className="max-w-3xl space-y-4 mb-10">
            {[
              { tier: 'Verified Advisor', desc: 'Listed in the smbX.ai advisor directory. Matched with platform users who need representation.' },
              { tier: 'Premier Partner', desc: 'Volume pricing on deliverables. Priority buyer matching. Co-branded marketing capabilities.' },
              { tier: 'Elite Partner', desc: 'Custom integrations. Dedicated account support. Early access to new features. Influence on the product roadmap.' },
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
