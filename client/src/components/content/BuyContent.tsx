export default function BuyContent() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-24 animate-[fadeIn_0.5s_ease]">
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        Buy a Business
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-8">
        Find the right deal.<br />Know it&apos;s the right deal.
      </h1>

      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        Every acquisition starts with a thesis. Yulia helps you define what you&apos;re looking for,
        screens opportunities against real market data, and models the deal before you make an offer.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Market Intelligence</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            Industry density, growth trends, competitive landscape, and active buyer/seller dynamics —
            all specific to your target market and geography.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Financial Modeling</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            SBA eligibility, capital structure scenarios, DSCR analysis, and ROI projections.
            Model the deal before you commit.
          </p>
        </div>
      </div>
    </div>
  );
}
