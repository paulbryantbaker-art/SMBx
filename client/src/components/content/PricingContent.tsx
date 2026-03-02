export default function PricingContent() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-24 animate-[fadeIn_0.5s_ease]">
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        Pricing
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-8">
        If you could Google it,<br />it should be free.
      </h1>

      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        Basic intelligence is free. Premium deliverables cost real dollars from your wallet —
        no subscriptions, no tiers, no surprises. Pay only when you need to go deeper.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free tier */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-[20px] font-bold text-[#2D3142] mb-1">Always Free</h3>
          <p className="text-[14px] text-[#4F5D75] mb-6">No account required to start.</p>
          <ul className="space-y-3 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Preliminary business valuation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Industry market snapshot
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              SBA eligibility screening
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Basic financial analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Deal intake &amp; initial guidance
            </li>
          </ul>
        </div>

        {/* Premium tier */}
        <div className="rounded-2xl border border-[rgba(212,113,78,0.2)] p-6" style={{ background: '#FFF8F4' }}>
          <h3 className="text-[20px] font-bold text-[#2D3142] mb-1">Premium Intelligence</h3>
          <p className="text-[14px] text-[#4F5D75] mb-6">Pay-as-you-go from your wallet.</p>
          <ul className="space-y-3 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] font-semibold min-w-[48px]">$5–25</span>
              Quick valuations, market snapshots
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] font-semibold min-w-[48px]">$25–100</span>
              Full CIM drafts, buyer lists, models
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] font-semibold min-w-[48px]">$100+</span>
              Deep research, full DD suites
            </li>
          </ul>
          <p className="text-[12px] text-[#4F5D75] mt-6 pt-4 border-t border-[rgba(212,113,78,0.15)]">
            Prices scale with deal size. $1 in your wallet = $1 purchasing power.
            Top up starting at $50. Volume bonuses up to 30%.
          </p>
        </div>
      </div>
    </div>
  );
}
