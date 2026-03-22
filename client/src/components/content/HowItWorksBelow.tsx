interface HowItWorksBelowProps {
  onChipClick: (text: string) => void;
}

export default function HowItWorksBelow({ onChipClick }: HowItWorksBelowProps) {
  return (
    <div className="stitch-howitworks">
      <style>{`
        .stitch-howitworks {
          --on-surface: #1a1c1c;
          --surface: #f9f9f9;
          --tertiary: #95432b;
          --on-surface-variant: #55433d;
          --surface-container-lowest: #ffffff;
          --surface-container-low: #f3f3f3;
          --surface-container: #eeeeee;
          --outline-variant: #dbc1ba;
          --primary-container: #747474;
          --error: #ba1a1a;
          font-family: 'Inter', sans-serif;
          background-color: #F9F9F9;
          color: #1A1C1C;
        }
        .stitch-howitworks .editorial-spacing {
          margin-top: 160px;
          margin-bottom: 160px;
        }
        .stitch-howitworks .ghost-border {
          border: 1px solid rgba(219, 193, 186, 0.2);
        }
        .stitch-howitworks .tertiary-accent {
          color: #C96B4F;
        }
        .stitch-howitworks .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="px-12 max-w-[1920px] mx-auto editorial-spacing">
          <div className="max-w-4xl">
            <span
              className="label-sm uppercase tracking-widest font-bold text-[11px] mb-6 block"
              style={{ color: '#C96B4F' }}
            >
              THE ARCHITECT OF M&A
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12" style={{ color: 'var(--on-surface)' }}>
              Bloomberg charges $24,000 a year. <br />
              <span style={{ color: 'var(--primary-container)' }}>You have Google.</span>
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed max-w-2xl" style={{ color: 'var(--on-surface-variant)' }}>
              We turn the open web into a high-octane terminal for M&A. Professional intelligence shouldn't be gated by a subscription that costs more than a car.
            </p>
          </div>
        </section>

        {/* Trust Logos */}
        <section className="px-12 max-w-[1920px] mx-auto mb-40">
          <div className="border-t border-b py-12" style={{ borderColor: 'rgba(219, 193, 186, 0.2)' }}>
            <div className="flex flex-wrap justify-between items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-black text-xl tracking-tighter">CENSUS BUREAU</div>
              <div className="flex items-center gap-2 font-black text-xl tracking-tighter">BLS</div>
              <div className="flex items-center gap-2 font-black text-xl tracking-tighter">FRED</div>
              <div className="flex items-center gap-2 font-black text-xl tracking-tighter">SEC EDGAR</div>
              <div className="flex items-center gap-2 font-black text-xl tracking-tighter">SBA</div>
              <div className="flex items-center gap-2 font-black text-xl tracking-tighter">IRS SOI</div>
            </div>
          </div>
        </section>

        {/* Seven Dimensions Section */}
        <section className="px-12 max-w-[1920px] mx-auto editorial-spacing">
          <div className="mb-20">
            <h2 className="text-4xl font-black tracking-tighter mb-4">The Seven Dimensions.</h2>
            <p className="max-w-xl text-lg leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
              smbx.ai analyzes every deal through a rigid architectural framework, ensuring no blind spots in your acquisition strategy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="ghost-border rounded-xl flex flex-col justify-between min-h-[300px] hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: 'var(--surface-container-lowest)', padding: 40 }}>
              <div className="mb-6" style={{ color: '#C96B4F' }}>
                <span className="material-symbols-outlined text-4xl" data-icon="analytics">analytics</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Market Saturation</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                  Real-time mapping of competitors and regional density using localized business registries.
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="ghost-border rounded-xl flex flex-col justify-between min-h-[300px] hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: 'var(--surface-container-lowest)', padding: 40 }}>
              <div className="mb-6" style={{ color: '#C96B4F' }}>
                <span className="material-symbols-outlined text-4xl" data-icon="account_balance">account_balance</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Financial Benchmarking</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                  Comparison against IRS SOI data to validate margins and EBITDA multiples in specific sectors.
                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="ghost-border rounded-xl flex flex-col justify-between min-h-[300px] hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: 'var(--surface-container-lowest)', padding: 40 }}>
              <div className="mb-6" style={{ color: '#C96B4F' }}>
                <span className="material-symbols-outlined text-4xl" data-icon="group">group</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Labor Dynamics</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                  Analysis of BLS wage data and regional talent availability to project future scaling costs.
                </p>
              </div>
            </div>
            {/* Card 4 */}
            <div className="ghost-border rounded-xl flex flex-col justify-between min-h-[300px] hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: 'var(--surface-container-lowest)', padding: 40 }}>
              <div className="mb-6" style={{ color: '#C96B4F' }}>
                <span className="material-symbols-outlined text-4xl" data-icon="gavel">gavel</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">Regulatory Audit</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                  Automated sweeps of SEC filings and local permit data to identify hidden liabilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conversation Block Comparison */}
        <section className="py-32 editorial-spacing" style={{ backgroundColor: 'var(--surface-container-low)' }}>
          <div className="px-12 max-w-[1920px] mx-auto">
            <div className="mb-20 text-center">
              <h2 className="text-5xl font-black tracking-tighter mb-4">Context-Aware Analysis.</h2>
              <p className="text-lg" style={{ color: 'var(--on-surface-variant)' }}>
                We don't just process data; we understand industries.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Landscaping Chat */}
              <div className="p-12 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
                <span
                  className="label-sm font-bold mb-8 block tracking-widest uppercase"
                  style={{ color: '#C96B4F' }}
                >
                  VERTICAL: LANDSCAPING
                </span>
                <div className="space-y-8">
                  <div>
                    <span className="label-sm font-medium mb-2 block" style={{ color: '#C96B4F' }}>USER</span>
                    <p className="text-xl font-medium">Evaluate the seasonality of this lawn care firm.</p>
                  </div>
                  <div className="pl-6" style={{ borderLeft: '2px solid rgba(201, 107, 79, 0.2)' }}>
                    <span className="label-sm font-medium mb-2 block" style={{ color: '#C96B4F' }}>YULIA AI</span>
                    <p className="leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                      Analyzing USDA weather patterns for Zone 7. Given the 15% snow removal revenue, I've adjusted the EBITDA multiple to reflect counter-cyclical resilience.
                    </p>
                  </div>
                </div>
              </div>
              {/* Manufacturing Chat */}
              <div className="p-12 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
                <span
                  className="label-sm font-bold mb-8 block tracking-widest uppercase"
                  style={{ color: '#C96B4F' }}
                >
                  VERTICAL: MANUFACTURING
                </span>
                <div className="space-y-8">
                  <div>
                    <span className="label-sm font-medium mb-2 block" style={{ color: '#C96B4F' }}>USER</span>
                    <p className="text-xl font-medium">What's the supply chain risk for this CNC shop?</p>
                  </div>
                  <div className="pl-6" style={{ borderLeft: '2px solid rgba(201, 107, 79, 0.2)' }}>
                    <span className="label-sm font-medium mb-2 block" style={{ color: '#C96B4F' }}>YULIA AI</span>
                    <p className="leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                      Cross-referencing global titanium prices via FRED. The firm's reliance on a single Tier-2 supplier in Germany creates a 22% volatility risk in gross margins.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ChatGPT vs smbx.ai Side-by-Side */}
        <section className="px-12 max-w-[1920px] mx-auto editorial-spacing">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-black tracking-tighter mb-16 text-center">What does this do that ChatGPT can't?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px overflow-hidden rounded-2xl ghost-border" style={{ backgroundColor: 'rgba(219, 193, 186, 0.3)' }}>
              <div className="p-12" style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
                <h4 className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-8">Standard LLM</h4>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined" data-icon="close" style={{ color: 'var(--error)' }}>close</span>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Generalizes business advice based on training data.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined" data-icon="close" style={{ color: 'var(--error)' }}>close</span>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Hallucinates financial multiples and local regulations.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined" data-icon="close" style={{ color: 'var(--error)' }}>close</span>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Limited to a 2023 knowledge cutoff.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-12">
                <h4 className="font-bold uppercase tracking-widest text-xs mb-8" style={{ color: '#C96B4F' }}>smbx.ai</h4>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined" data-icon="check_circle" style={{ color: '#C96B4F' }}>check_circle</span>
                    <span className="font-bold">Hard-coded integration with Federal &amp; State databases.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined" data-icon="check_circle" style={{ color: '#C96B4F' }}>check_circle</span>
                    <span className="font-bold">Verifiable, real-time citation for every EBITDA multiple.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined" data-icon="check_circle" style={{ color: '#C96B4F' }}>check_circle</span>
                    <span className="font-bold">Live web-scraping of competitor pricing and permit history.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-12 max-w-[1920px] mx-auto editorial-spacing text-center">
          <div className="max-w-3xl mx-auto py-24 bg-black text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
              <span className="text-[300px] font-black tracking-tighter">X</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-10 relative z-10">
              Stop guessing. <br />Start architecting.
            </h2>
            <button
              onClick={() => onChipClick('See for yourself')}
              className="text-white px-10 py-5 text-lg font-bold transition-all relative z-10"
              style={{ backgroundColor: '#C96B4F' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b45b40'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#C96B4F'; }}
            >
              See for yourself
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
