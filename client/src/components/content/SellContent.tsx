export default function SellContent() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-24 animate-[fadeIn_0.5s_ease]">
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        Sell Your Business
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-8">
        Know your number<br />before you negotiate.
      </h1>

      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        Most owners leave money on the table because they don&apos;t know what their business is actually worth.
        Yulia analyzes your financials, market position, and buyer landscape to give you a defensible valuation
        before you talk to anyone.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">Add-backs: the value hiding in your financials</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            Owner compensation, personal expenses, one-time costs — add-backs can increase your valuation by 20-40%.
            Yulia identifies what qualifies and what doesn&apos;t.
          </p>
          <ul className="space-y-2 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Owner salary above market rate
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Personal vehicle, insurance, travel
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              One-time legal or consulting fees
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Family members on payroll
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">Your buyer&apos;s financing is your problem too</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            80% of small business acquisitions involve SBA lending. If your deal doesn&apos;t pass DSCR, your buyer
            can&apos;t close. Yulia models the financing before you go to market.
          </p>
          <ul className="space-y-2 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              SBA eligibility pre-screening
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              DSCR analysis at multiple price points
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Seller note structuring options
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4714E] mt-0.5">&#10003;</span>
              Equity injection requirements
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
