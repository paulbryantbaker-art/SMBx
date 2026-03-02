export default function HomeContent() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-24 animate-[fadeIn_0.5s_ease]">
      {/* Badge */}
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        The SMBX Methodology
      </span>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-2">
        The data is public.
      </h1>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#D4714E] mb-8">
        The intelligence is not.
      </h1>

      {/* Subtitle */}
      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        The same market data that powers Wall Street is available to anyone. What isn&apos;t
        available is an advisor who can synthesize all of it into a deal-specific analysis in
        minutes. That&apos;s what Yulia does.
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">7 Layers of Analysis</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            Evaluated across industry structure, regional economics, financials, buyers, and risks.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Localized to Your Market</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            A plumbing deal in Phoenix differs from one in PA. Our intelligence is specific to your metro.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Calibrated by Size</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            Yulia adapts her methodology from $400K Main Street sales to $40M PE platform plays.
          </p>
        </div>
      </div>
    </div>
  );
}
