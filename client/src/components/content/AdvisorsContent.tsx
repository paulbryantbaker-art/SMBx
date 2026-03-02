export default function AdvisorsContent() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-24 animate-[fadeIn_0.5s_ease]">
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        For Advisors
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-8">
        Your expertise closes deals.<br />Now close more of them.
      </h1>

      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        Brokers, M&amp;A advisors, and transaction professionals use Yulia to package listings faster,
        qualify buyers instantly, and bring localized market intelligence to every pitch.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="text-[28px] font-extrabold text-[#D4714E] mb-3">01</div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Intake &amp; Analysis</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            Share the deal details. Yulia runs seven layers of analysis — industry structure, market position,
            financial normalization, and competitive dynamics.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="text-[28px] font-extrabold text-[#D4714E] mb-3">02</div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Package &amp; Position</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            Generate professional CIMs, blind teasers, and valuation reports. Every document
            is grounded in real data and formatted for buyer consumption.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="text-[28px] font-extrabold text-[#D4714E] mb-3">03</div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Match &amp; Close</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            Screen buyers, model deal structures, and prepare diligence packages.
            Walk into every negotiation with the numbers already done.
          </p>
        </div>
      </div>
    </div>
  );
}
