interface RaiseBelowProps {
  onChipClick: (text: string) => void;
}

export default function RaiseBelow({ onChipClick }: RaiseBelowProps) {
  return (
    <div className="stitch-raise font-body selection:bg-tertiary/20">
      <style>{`
        .stitch-raise {
          --on-surface: #1a1c1c;
          --surface: #f9f9f9;
          --tertiary: #95432b;
          --on-surface-variant: #55433d;
          --surface-container-lowest: #ffffff;
          --surface-container-low: #f3f3f3;
          --surface-container: #eeeeee;
          --outline-variant: #dbc1ba;
          --primary: #5c5c5c;
          --inverse-surface: #2f3131;
          --on-tertiary: #ffffff;
        }
        .stitch-raise .editorial-line-height { line-height: 1.6; }
        .stitch-raise .ghost-border { border: 1px solid rgba(219,193,186,0.2); }
        .stitch-raise .custom-shadow { box-shadow: 0 4px 24px 0 rgba(26,28,28,0.04); }
      `}</style>

      {/* Hero Section */}
      <section className="pt-48 pb-40 px-12 max-w-[1920px] mx-auto">
        <div className="max-w-4xl">
          <span className="inline-block px-3 py-1 bg-tertiary text-white text-[11px] font-bold tracking-[0.1em] uppercase mb-8">Capital Strategy</span>
          <h1 className="text-[64px] font-black leading-[1.05] tracking-tighter text-on-surface mb-12">
            A 5% difference in dilution today is a $2.5 million difference at exit
          </h1>
          <p className="text-xl text-on-surface-variant editorial-line-height max-w-2xl font-medium">
            Securing capital isn&apos;t just about the check&mdash;it&apos;s about the architecture of your future equity. We help you navigate the complex terrain of debt, equity, and mezzanine financing with editorial precision.
          </p>
        </div>
      </section>

      {/* Financing Options Grid (Bento Style) */}
      <section className="py-40 bg-surface-container-low">
        <div className="px-12 max-w-[1920px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black tracking-tighter mb-6 text-on-surface">The Financing Spectrum</h2>
              <p className="text-on-surface-variant editorial-line-height">Five distinct pathways to fuel your growth. We analyze each through the lens of cost-of-capital and long-term control.</p>
            </div>
            <div className="text-tertiary font-black text-8xl opacity-10 leading-none select-none">RAISE</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Revenue-based */}
            <div className="bg-surface-container-lowest p-10 xl:p-12 custom-shadow ghost-border flex flex-col justify-between aspect-square group">
              <div>
                <span className="material-symbols-outlined text-tertiary mb-8 text-4xl">payments</span>
                <h3 className="text-2xl font-black mb-4">Revenue-based</h3>
                <p className="text-on-surface-variant editorial-line-height text-sm">Non-dilutive funding based on monthly recurring revenue. Perfect for scaling without giving up board seats.</p>
              </div>
              <div className="pt-8 border-t border-surface-container-low flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-widest text-on-surface uppercase">Low Dilution</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>
            {/* SBA */}
            <div className="bg-surface-container-lowest p-10 xl:p-12 custom-shadow ghost-border flex flex-col justify-between aspect-square group">
              <div>
                <span className="material-symbols-outlined text-tertiary mb-8 text-4xl">account_balance</span>
                <h3 className="text-2xl font-black mb-4">SBA</h3>
                <p className="text-on-surface-variant editorial-line-height text-sm">Government-backed loans offering competitive rates and longer terms for established businesses looking to expand.</p>
              </div>
              <div className="pt-8 border-t border-surface-container-low flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-widest text-on-surface uppercase">Fixed Rates</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>
            {/* Equity */}
            <div className="bg-surface-container-lowest p-10 xl:p-12 custom-shadow ghost-border flex flex-col justify-between aspect-square group">
              <div>
                <span className="material-symbols-outlined text-tertiary mb-8 text-4xl">pie_chart</span>
                <h3 className="text-2xl font-black mb-4">Equity</h3>
                <p className="text-on-surface-variant editorial-line-height text-sm">Venture capital and private equity partnerships. Trading ownership for high-velocity growth resources.</p>
              </div>
              <div className="pt-8 border-t border-surface-container-low flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-widest text-on-surface uppercase">High Velocity</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>
            {/* Strategic */}
            <div className="bg-surface-container-lowest p-10 xl:p-12 custom-shadow ghost-border flex flex-col justify-between aspect-square md:col-span-1 group">
              <div>
                <span className="material-symbols-outlined text-tertiary mb-8 text-4xl">handshake</span>
                <h3 className="text-2xl font-black mb-4">Strategic</h3>
                <p className="text-on-surface-variant editorial-line-height text-sm">Investment from industry leaders providing more than capital&mdash;distribution, expertise, and exit potential.</p>
              </div>
              <div className="pt-8 border-t border-surface-container-low flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-widest text-on-surface uppercase">Market Synergy</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>
            {/* Mezzanine */}
            <div className="bg-surface-container-lowest p-10 xl:p-12 custom-shadow ghost-border flex flex-col justify-between md:col-span-2 group">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1">
                  <span className="material-symbols-outlined text-tertiary mb-8 text-4xl">layers</span>
                  <h3 className="text-3xl font-black mb-4">Mezzanine</h3>
                  <p className="text-on-surface-variant editorial-line-height text-lg">The hybrid layer. Subordinated debt with equity kickers, bridging the gap between bank debt and pure equity for mature companies.</p>
                </div>
                <div className="w-full md:w-64 h-48 bg-surface overflow-hidden">
                  <img
                    className="w-full h-full object-cover grayscale opacity-50"
                    alt="Abstract architectural lines and shadows"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC--4t7_h8i7d4b-l61LwVTw5vKABsXqzpcgbH2-AAFHjWPfF_zkWNXltOal8fkqL-oSqd5sIGQyqZqf-VT0GtwaZ0iQKHy-5E5YiExr0Ma6UXLfJXm4docKzpfRwGEhu17mv6-kseUmtQYZIXypGuhsJGPeFdTCKIh0LFMWwbcJAnXt3jMGhLQOcu7YNzFNG3X5B_dOc1LHBAM-4s3-vDkiWZI_X5s-dxS-PthrYRWXxdhq0B0pVMZB1DoRGlEMCKo887X5OZtSv0"
                  />
                </div>
              </div>
              <div className="pt-8 mt-12 border-t border-surface-container-low flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-widest text-on-surface uppercase">Hybrid Capital</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yulia's Deliverables Section */}
      <section className="py-60 px-12 max-w-[1920px] mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-5 sticky top-32">
            <span className="text-tertiary font-black text-5xl mb-6 block leading-none">X</span>
            <h2 className="text-5xl font-black tracking-tighter mb-8 text-on-surface">Yulia&apos;s Deliverables</h2>
            <p className="text-xl text-on-surface-variant editorial-line-height mb-12">
              Your raise is managed by Yulia, our AI-powered editorial architect. Every document produced is designed to meet the rigorous standards of Tier-1 institutional investors.
            </p>
            <button
              onClick={() => onChipClick('Tell Yulia about your raise')}
              className="px-10 py-5 bg-black text-white font-bold text-sm tracking-widest uppercase hover:bg-tertiary transition-colors cursor-pointer"
            >
              Tell Yulia about your raise
            </button>
          </div>
          <div className="lg:col-span-7 space-y-px">
            <div className="group border-b border-outline-variant/30 py-12 flex justify-between items-start transition-all hover:pl-4">
              <div className="max-w-md">
                <h4 className="text-2xl font-black mb-3">Pitch Deck</h4>
                <p className="text-on-surface-variant text-sm editorial-line-height">A narrative-driven presentation that synthesizes your market opportunity into a compelling investor story.</p>
              </div>
              <span className="text-tertiary font-bold font-mono text-sm">01</span>
            </div>
            <div className="group border-b border-outline-variant/30 py-12 flex justify-between items-start transition-all hover:pl-4">
              <div className="max-w-md">
                <h4 className="text-2xl font-black mb-3">Financial Model</h4>
                <p className="text-on-surface-variant text-sm editorial-line-height">Dynamic 3-statement models built for stress-testing and scenario analysis across multiple growth paths.</p>
              </div>
              <span className="text-tertiary font-bold font-mono text-sm">02</span>
            </div>
            <div className="group border-b border-outline-variant/30 py-12 flex justify-between items-start transition-all hover:pl-4">
              <div className="max-w-md">
                <h4 className="text-2xl font-black mb-3">Data Room Architecture</h4>
                <p className="text-on-surface-variant text-sm editorial-line-height">A curated, logical repository for all due diligence materials, organized to minimize friction in the review process.</p>
              </div>
              <span className="text-tertiary font-bold font-mono text-sm">03</span>
            </div>
            <div className="group border-b border-outline-variant/30 py-12 flex justify-between items-start transition-all hover:pl-4">
              <div className="max-w-md">
                <h4 className="text-2xl font-black mb-3">Cap Table Analysis</h4>
                <p className="text-on-surface-variant text-sm editorial-line-height">Precision modelling of dilution scenarios and exit waterfalls to protect founder interests.</p>
              </div>
              <span className="text-tertiary font-bold font-mono text-sm">04</span>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Editorial CTA */}
      <section className="mb-40 px-12 max-w-[1920px] mx-auto">
        <div className="bg-on-surface py-32 px-12 md:px-24 flex flex-col items-center text-center relative overflow-hidden">
          {/* Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-[400px] font-black text-white select-none">SMBX</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-12 relative z-10">Ready to secure your future?</h2>
          <div className="flex flex-col md:flex-row gap-6 relative z-10">
            <button
              onClick={() => onChipClick('Tell Yulia about your raise')}
              className="px-12 py-6 bg-tertiary text-white font-bold tracking-tight hover:opacity-90 transition-all text-lg cursor-pointer"
            >
              Tell Yulia about your raise
            </button>
            <button className="px-12 py-6 border border-white/30 text-white font-bold tracking-tight hover:bg-white/10 transition-all text-lg cursor-pointer">
              View Methodology
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
