interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  return (
    <div className="stitch-buy">
      <style>{`
        .stitch-buy {
          --on-surface: #1a1c1c;
          --surface: #f9f9f9;
          --tertiary: #95432b;
          --on-surface-variant: #55433d;
          --surface-container-lowest: #ffffff;
          --surface-container-low: #f3f3f3;
          --surface-container: #eeeeee;
          --surface-container-high: #e8e8e8;
          --surface-container-highest: #e2e2e2;
          --outline-variant: #dbc1ba;
          --primary: #5c5c5c;
          --inverse-surface: #2f3131;
          --error: #ba1a1a;
          --primary-container: #747474;

          color: var(--on-surface);
          font-family: 'Inter', sans-serif;
        }

        .stitch-buy .bg-surface { background-color: var(--surface); }
        .stitch-buy .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-buy .bg-surface-container-low { background-color: var(--surface-container-low); }
        .stitch-buy .bg-surface-container { background-color: var(--surface-container); }
        .stitch-buy .bg-surface-container-high { background-color: var(--surface-container-high); }
        .stitch-buy .bg-surface-container-highest { background-color: var(--surface-container-highest); }
        .stitch-buy .bg-tertiary { background-color: var(--tertiary); }
        .stitch-buy .bg-inverse-surface { background-color: var(--inverse-surface); }
        .stitch-buy .bg-primary-container { background-color: var(--primary-container); }

        .stitch-buy .text-on-surface { color: var(--on-surface); }
        .stitch-buy .text-on-surface-variant { color: var(--on-surface-variant); }
        .stitch-buy .text-tertiary { color: var(--tertiary); }
        .stitch-buy .text-primary { color: var(--primary); }
        .stitch-buy .text-error { color: var(--error); }
        .stitch-buy .text-inverse-surface { color: var(--inverse-surface); }

        .stitch-buy .border-outline-variant\\/10 { border-color: rgba(219, 193, 186, 0.1); }
        .stitch-buy .border-outline-variant\\/20 { border-color: rgba(219, 193, 186, 0.2); }
        .stitch-buy .border-outline-variant\\/30 { border-color: rgba(219, 193, 186, 0.3); }
        .stitch-buy .border-outline-variant\\/5 { border-color: rgba(219, 193, 186, 0.05); }

        .stitch-buy .hover\\:bg-tertiary:hover { background-color: var(--tertiary); }

        .stitch-buy .selection\\:bg-tertiary\\/20 ::selection { background-color: rgba(149, 67, 43, 0.2); }

        .stitch-buy .editorial-spacing { margin-top: 160px; margin-bottom: 160px; }

        .stitch-buy .hero-mask {
          background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #F9F9F9 100%);
        }

        .stitch-buy .font-headline { font-family: 'Inter', sans-serif; }
        .stitch-buy .font-body { font-family: 'Inter', sans-serif; }
        .stitch-buy .font-label { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Hero Section */}
      <section className="px-12 max-w-7xl mx-auto editorial-spacing">
        <div className="max-w-4xl">
          <span className="font-label text-[11px] tracking-[0.2em] text-tertiary uppercase font-bold mb-8 block">
            THE BUY JOURNEY
          </span>
          <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-on-surface mb-12">
            The deal that looked perfect on paper<span className="text-tertiary">.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl leading-relaxed text-xl">
            Most acquisitions fail before the LOI is even signed. We provide the editorial precision and architectural data required to navigate the DFW HVAC market and beyond.
          </p>
        </div>
      </section>

      {/* SBA & Market Context Grid (Bento Style) */}
      <section className="px-12 max-w-[1920px] mx-auto editorial-spacing">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* SBA Data Card */}
          <div className="md:col-span-4 bg-surface-container-lowest p-10 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-tertiary"
                data-icon="account_balance"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
              <h3 className="font-headline text-xl font-bold">SBA Check</h3>
            </div>
            <div className="space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <p className="text-[11px] font-label tracking-widest text-on-surface-variant uppercase mb-1">
                  Pre-Approval Probability
                </p>
                <p className="text-3xl font-black">94.2%</p>
              </div>
              <div className="border-b border-outline-variant/20 pb-4">
                <p className="text-[11px] font-label tracking-widest text-on-surface-variant uppercase mb-1">
                  Debt Service Coverage
                </p>
                <p className="text-3xl font-black">1.85x</p>
              </div>
              <div className="pt-2">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Based on current TTM EBITDA and 7(a) loan guidelines for Texas region.
                </p>
              </div>
            </div>
          </div>

          {/* DFW HVAC Market Context */}
          <div className="md:col-span-8 bg-surface-container-low p-10 rounded-xl">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="font-label text-[11px] tracking-widest text-tertiary uppercase font-bold mb-2 block">
                  MARKET ARCHITECTURE
                </span>
                <h3 className="font-headline text-3xl font-bold">DFW HVAC Market Context</h3>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold">Q4 2024 Report</p>
                <p className="text-xs text-on-surface-variant">Update: 2h ago</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/5">
                <p className="text-xs font-label text-on-surface-variant uppercase tracking-tighter mb-4">
                  Avg. Multiple
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">4.2x</span>
                  <span className="text-green-600 text-xs font-bold">+0.3</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/5">
                <p className="text-xs font-label text-on-surface-variant uppercase tracking-tighter mb-4">
                  Deal Velocity
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">18d</span>
                  <span className="text-on-surface-variant text-xs font-bold">avg.</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/5">
                <p className="text-xs font-label text-on-surface-variant uppercase tracking-tighter mb-4">
                  Inventory
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">142</span>
                  <span className="text-tertiary text-xs font-bold">Low</span>
                </div>
              </div>
            </div>
            <div className="mt-8 overflow-hidden rounded-lg">
              <img
                className="w-full h-48 object-cover grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                alt="Abstract architectural map of Dallas Fort Worth metropolitan area"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkdUjAloi4WUNXjic1A-tcPPT8Ar1Wd5dEUqvA-rWgXrzOvSx-SGgkfbgySIu3c8b6Et3qhk3_L55_7SGyMUSrlJHQlZG6Ieynwa1UVyMd7C5NQFeJcY4bFd8qACOk-yjv2bqtRMwjjmydeXXUHf1gvE13DzWs7F4hW--Sqfi0ZxJRjlmowYGu_88ZwopQR-K8NgbSiFLczSgDWiK_3cyf86TZ0AeoY6zJxDI37dXmyXzZyzZY7w-AoZd9t3y2RnYmxhv1SMbl5oU"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Yulia AI Conversation Block */}
      <section className="bg-surface-container-lowest py-32 border-y border-outline-variant/10">
        <div className="max-w-4xl mx-auto px-12">
          <div className="mb-20 text-center">
            <span className="font-label text-[11px] tracking-[0.3em] text-tertiary uppercase font-bold mb-4 block">
              THE DIALOGUE
            </span>
            <h2 className="text-4xl font-black tracking-tight">Narrative Intelligence</h2>
          </div>
          <div className="space-y-16">
            <div>
              <span className="font-label text-[11px] text-tertiary uppercase font-bold tracking-widest mb-2 block">
                USER
              </span>
              <p className="text-2xl font-medium text-on-surface leading-tight">
                &ldquo;Yulia, show me the risk profile for an HVAC firm in Dallas with $2M revenue and 15% net margins.&rdquo;
              </p>
            </div>
            <div className="pl-8 border-l-2 border-tertiary/20">
              <span className="font-label text-[11px] text-tertiary uppercase font-bold tracking-widest mb-2 block">
                YULIA AI
              </span>
              <div className="text-xl text-on-surface-variant leading-relaxed space-y-4">
                <p>
                  Analyzing 4,200 regional transactions. The 15% margin is slightly below the DFW median of 18.2% for firms of this scale. The primary risk factor is <strong>Customer Concentration</strong>; if more than 25% of revenue comes from new construction builders, the SBA pre-approval probability drops to 68%.
                </p>
                <p>
                  Would you like to see the{' '}
                  <span className="text-on-surface font-bold underline decoration-tertiary decoration-2 underline-offset-4">
                    Depreciation Shield
                  </span>{' '}
                  comparison for this asset class?
                </p>
              </div>
            </div>
          </div>
          <div className="mt-20">
            <div className="relative group">
              <input
                className="w-full bg-surface-container-low border-b border-outline-variant/30 py-6 px-4 text-xl focus:outline-none focus:border-on-surface transition-all placeholder:text-stone-300"
                placeholder="Tell Yulia what you're looking for..."
                type="text"
                readOnly
                onClick={() => onChipClick("Tell Yulia what you're looking for")}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:scale-110 transition-transform"
                onClick={() => onChipClick("Tell Yulia what you're looking for")}
              >
                <span
                  className="material-symbols-outlined text-3xl"
                  data-icon="arrow_forward"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Depreciation Shield Comparison */}
      <section className="px-12 max-w-7xl mx-auto editorial-spacing">
        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1">
            <h2 className="font-headline text-5xl font-black tracking-tight mb-8">
              Year-by-year Depreciation Shield
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              We don&apos;t just calculate purchase price; we architect the tax efficiency of the entire holding period. Our proprietary shield model shows the cash flow impact of accelerated depreciation on fleet and equipment.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-tertiary"></div>
                <span className="text-sm font-bold">smbx.ai Optimized Strategy</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-stone-300"></div>
                <span className="text-sm text-stone-500">Traditional Accounting</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="h-64 flex items-end gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="bg-stone-100 h-24 w-full"></div>
                  <div className="bg-tertiary h-48 w-full"></div>
                  <span className="text-[10px] font-bold text-center mt-2">YR 1</span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="bg-stone-100 h-32 w-full"></div>
                  <div className="bg-tertiary h-40 w-full"></div>
                  <span className="text-[10px] font-bold text-center mt-2">YR 2</span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="bg-stone-100 h-28 w-full"></div>
                  <div className="bg-tertiary h-32 w-full"></div>
                  <span className="text-[10px] font-bold text-center mt-2">YR 3</span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="bg-stone-100 h-20 w-full"></div>
                  <div className="bg-tertiary h-24 w-full"></div>
                  <span className="text-[10px] font-bold text-center mt-2">YR 4</span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="bg-stone-100 h-16 w-full"></div>
                  <div className="bg-tertiary h-16 w-full"></div>
                  <span className="text-[10px] font-bold text-center mt-2">YR 5</span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-stone-100 flex justify-between">
                <div>
                  <p className="text-[10px] font-label text-stone-400 uppercase tracking-widest">
                    Total Shield
                  </p>
                  <p className="text-2xl font-black">$482,000</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-label text-stone-400 uppercase tracking-widest">
                    Tax Delta
                  </p>
                  <p className="text-2xl font-black text-tertiary">+22%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOI Terms Grid */}
      <section className="bg-stone-900 py-32 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-12">
          <div className="mb-20">
            <span className="font-label text-[11px] tracking-[0.3em] text-tertiary uppercase font-bold mb-4 block">
              THE ARCHITECTURE
            </span>
            <h2 className="text-5xl font-black tracking-tight">LOI Terms Structure</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <div className="bg-white text-stone-900 p-10 hover:bg-tertiary hover:text-white transition-all duration-500 group">
              <p className="text-[11px] font-label tracking-widest mb-12 uppercase group-hover:text-white/70">
                Component 01
              </p>
              <h4 className="text-2xl font-bold mb-4 leading-tight">Working Capital Peg</h4>
              <p className="text-sm leading-relaxed opacity-70">
                Calculated based on a 12-month rolling average to ensure liquidity on day one.
              </p>
            </div>
            <div className="bg-white text-stone-900 p-10 hover:bg-tertiary hover:text-white transition-all duration-500 group">
              <p className="text-[11px] font-label tracking-widest mb-12 uppercase group-hover:text-white/70">
                Component 02
              </p>
              <h4 className="text-2xl font-bold mb-4 leading-tight">Seller Note Terms</h4>
              <p className="text-sm leading-relaxed opacity-70">
                10% rollover with performance-based earnouts at months 12 and 24.
              </p>
            </div>
            <div className="bg-white text-stone-900 p-10 hover:bg-tertiary hover:text-white transition-all duration-500 group">
              <p className="text-[11px] font-label tracking-widest mb-12 uppercase group-hover:text-white/70">
                Component 03
              </p>
              <h4 className="text-2xl font-bold mb-4 leading-tight">Non-Compete Radius</h4>
              <p className="text-sm leading-relaxed opacity-70">
                50-mile radius for 5 years covering all current and future service lines.
              </p>
            </div>
            <div className="bg-white text-stone-900 p-10 hover:bg-tertiary hover:text-white transition-all duration-500 group">
              <p className="text-[11px] font-label tracking-widest mb-12 uppercase group-hover:text-white/70">
                Component 04
              </p>
              <h4 className="text-2xl font-bold mb-4 leading-tight">Asset vs Stock</h4>
              <p className="text-sm leading-relaxed opacity-70">
                Structured as an Asset Purchase Agreement for maximum step-up basis.
              </p>
            </div>
            <div className="bg-white text-stone-900 p-10 hover:bg-tertiary hover:text-white transition-all duration-500 group">
              <p className="text-[11px] font-label tracking-widest mb-12 uppercase group-hover:text-white/70">
                Component 05
              </p>
              <h4 className="text-2xl font-bold mb-4 leading-tight">Exclusivity Period</h4>
              <p className="text-sm leading-relaxed opacity-70">
                60-day due diligence window with automatic 15-day extensions.
              </p>
            </div>
            <div className="bg-white text-stone-900 p-10 hover:bg-tertiary hover:text-white transition-all duration-500 group">
              <p className="text-[11px] font-label tracking-widest mb-12 uppercase group-hover:text-white/70">
                Component 06
              </p>
              <h4 className="text-2xl font-bold mb-4 leading-tight">Escrow Holdback</h4>
              <p className="text-sm leading-relaxed opacity-70">
                15% of purchase price held for 18 months against indemnity claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full Journey Timeline */}
      <section className="px-12 max-w-7xl mx-auto editorial-spacing">
        <div className="mb-20 text-center">
          <span className="font-label text-[11px] tracking-[0.3em] text-tertiary uppercase font-bold mb-4 block">
            THE ROADMAP
          </span>
          <h2 className="text-5xl font-black tracking-tight">The 5-Phase Acquisition Flow</h2>
        </div>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-stone-200 -z-10 hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="bg-surface-container-low md:bg-transparent p-6 md:p-0">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold mb-6 mx-auto md:mx-0">
                01
              </div>
              <h5 className="font-bold text-lg mb-2">Curation</h5>
              <p className="text-sm text-on-surface-variant">
                Defining your architectural buy-box and target sourcing.
              </p>
            </div>
            <div className="bg-surface-container-low md:bg-transparent p-6 md:p-0">
              <div className="w-12 h-12 bg-stone-200 text-stone-500 flex items-center justify-center font-bold mb-6 mx-auto md:mx-0">
                02
              </div>
              <h5 className="font-bold text-lg mb-2">Dialogue</h5>
              <p className="text-sm text-on-surface-variant">
                Confidential outreach and first-level narrative analysis.
              </p>
            </div>
            <div className="bg-surface-container-low md:bg-transparent p-6 md:p-0">
              <div className="w-12 h-12 bg-stone-200 text-stone-500 flex items-center justify-center font-bold mb-6 mx-auto md:mx-0">
                03
              </div>
              <h5 className="font-bold text-lg mb-2">LOI Design</h5>
              <p className="text-sm text-on-surface-variant">
                Structuring terms that prioritize long-term asset value.
              </p>
            </div>
            <div className="bg-surface-container-low md:bg-transparent p-6 md:p-0">
              <div className="w-12 h-12 bg-stone-200 text-stone-500 flex items-center justify-center font-bold mb-6 mx-auto md:mx-0">
                04
              </div>
              <h5 className="font-bold text-lg mb-2">Diligence</h5>
              <p className="text-sm text-on-surface-variant">
                Deep-dive technical, financial, and narrative auditing.
              </p>
            </div>
            <div className="bg-surface-container-low md:bg-transparent p-6 md:p-0">
              <div className="w-12 h-12 bg-stone-200 text-stone-500 flex items-center justify-center font-bold mb-6 mx-auto md:mx-0">
                05
              </div>
              <h5 className="font-bold text-lg mb-2">Closing</h5>
              <p className="text-sm text-on-surface-variant">
                Final integration architecture and asset handoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-tertiary py-40 text-white text-center">
        <div className="max-w-4xl mx-auto px-12">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-12">
            Build your legacy<span className="text-white/30">.</span>
          </h2>
          <button
            className="bg-white text-stone-900 px-12 py-6 text-xl font-bold hover:scale-105 transition-transform"
            onClick={() => onChipClick("Tell Yulia what you're looking for")}
          >
            Tell Yulia what you&apos;re looking for
          </button>
        </div>
      </section>
    </div>
  );
}
