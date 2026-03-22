interface PricingBelowProps {
  onChipClick: (text: string) => void;
}

export default function PricingBelow({ onChipClick }: PricingBelowProps) {
  return (
    <div className="stitch-pricing">
      <style>{`
        .stitch-pricing {
          --on-surface: #1a1c1c;
          --surface: #f9f9f9;
          --tertiary: #95432b;
          --on-surface-variant: #55433d;
          --surface-container-lowest: #ffffff;
          --surface-container-low: #f3f3f3;
          --surface-container: #eeeeee;
          --outline-variant: #dbc1ba;
          --on-surface-variant-60: rgba(85, 67, 61, 0.6);
          --brand-accent: #C96B4F;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          color: var(--on-surface);
        }
        .stitch-pricing .editorial-margin {
          margin-top: 160px;
          margin-bottom: 160px;
        }
        .stitch-pricing .glass-nav {
          backdrop-filter: blur(12px);
          background-color: rgba(255, 255, 255, 0.8);
        }
        .stitch-pricing .ghost-border {
          border: 1px solid rgba(219, 193, 186, 0.2);
        }
        @media (max-width: 767px) {
          .stitch-pricing .editorial-margin {
            margin-top: 80px;
            margin-bottom: 80px;
          }
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Hero Section */}
        <section className="editorial-margin max-w-4xl">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6 block" style={{ color: 'var(--tertiary)' }}>
            Pricing Architecture
          </span>
          <h1 className="text-[40px] md:text-[64px] font-extrabold leading-[1.1] tracking-tighter mb-12" style={{ color: 'var(--on-surface)' }}>
            Start free. <br />Stay because it works.
          </h1>
          <p className="text-lg max-w-2xl leading-[1.6]" style={{ color: 'var(--on-surface-variant)' }}>
            Our model is built on mutual success. We provide the infrastructure, the data architecture, and the editorial precision to close mid-market deals without the legacy overhead.
          </p>
        </section>

        {/* Bento Grid: Free Deliverables */}
        <section className="mb-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 p-8 md:p-12 rounded-xl ghost-border" style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
              <h2 className="text-2xl font-bold mb-8 tracking-tight">The Foundation (Always Free)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                <div className="flex flex-col gap-3">
                  <svg className="w-8 h-8" style={{ color: 'var(--tertiary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-8 4 4 5-6" />
                  </svg>
                  <h3 className="font-bold">Valuation Benchmarking</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                    Access real-time EBITDA multiples and sectoral liquidity maps for the SMB landscape.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <svg className="w-8 h-8" style={{ color: 'var(--tertiary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <h3 className="font-bold">Teaser Generation</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                    Generate high-impact, blind editorial teasers that capture institutional interest instantly.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <svg className="w-8 h-8" style={{ color: 'var(--tertiary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3v3m0 12v3m-9-9h3m12 0h3m-2.636-6.364l-2.121 2.121m-8.486 8.486l-2.121 2.121m0-12.728l2.121 2.121m8.486 8.486l2.121 2.121" />
                  </svg>
                  <h3 className="font-bold">Integration Audit</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                    One-click connection to Quickbooks or Xero for an automated preliminary data health check.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <svg className="w-8 h-8" style={{ color: 'var(--tertiary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M12 2a10 10 0 110 20 10 10 0 010-20z" />
                  </svg>
                  <h3 className="font-bold">Buyer Verification</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                    Pre-vetting of acquirers against proof-of-funds and past transactional integrity.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-between rounded-xl" style={{ backgroundColor: 'var(--surface-container-low)' }}>
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--tertiary)' }}>
                  Current State
                </span>
                <h3 className="text-3xl font-bold mt-4 mb-6 leading-tight">Zero upfront. Zero risk.</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                  We believe in earning our seat at the table. Explore the platform, map your market, and prepare your deal room without spending a dime.
                </p>
              </div>
              <button
                onClick={() => onChipClick('See for yourself')}
                className="w-full mt-12 bg-black text-white py-4 font-bold rounded-sm hover:opacity-90 transition-colors"
                style={{ backgroundColor: 'var(--on-surface)' }}
              >
                Launch Free Project
              </button>
            </div>
          </div>
        </section>

        {/* Main Fee Structure Cards */}
        <section className="mb-40">
          <div className="mb-20">
            <h2 className="text-[24px] font-bold tracking-tight">Transactional Tiers</h2>
            <div className="h-[2px] w-20 mt-4" style={{ backgroundColor: 'var(--tertiary)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t" style={{ borderColor: 'rgba(219, 193, 186, 0.2)' }}>
            {/* Card 1: Owner-Operated */}
            <div className="group py-16 px-8 flex flex-col hover:bg-white transition-colors" style={{ borderRight: '1px solid rgba(219, 193, 186, 0.2)' }}>
              <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--on-surface-variant-60)' }}>
                Tier 01
              </span>
              <h3 className="text-4xl font-black mt-4 mb-2 tracking-tighter">Owner-Operated</h3>
              <p className="text-sm mb-12" style={{ color: 'var(--on-surface-variant)' }}>
                Businesses with $500k - $2M EBITDA
              </p>
              <div className="mb-12">
                <div className="text-[48px] md:text-[64px] font-extrabold tracking-tighter leading-none mb-2">3.5%</div>
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--tertiary)' }}>
                  Success Fee
                </p>
              </div>
              <ul className="space-y-6 mb-16 text-sm flex-grow list-none p-0">
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Direct-to-Buyer Narrative Architecture</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Standard Virtual Data Room (VDR)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Automated Q&amp;A Management</span>
                </li>
              </ul>
              <button
                onClick={() => onChipClick('See for yourself')}
                className="w-full border border-black py-4 font-bold text-sm hover:bg-black hover:text-white transition-all"
              >
                Select Tier
              </button>
            </div>

            {/* Card 2: Established (Recommended) */}
            <div className="group py-16 px-8 flex flex-col relative" style={{ backgroundColor: 'var(--surface-container-low)', borderRight: '1px solid rgba(219, 193, 186, 0.2)' }}>
              <div
                className="absolute top-0 right-0 text-white text-[10px] font-bold uppercase px-4 py-1 tracking-widest"
                style={{ backgroundColor: 'var(--tertiary)' }}
              >
                Recommended
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--on-surface-variant-60)' }}>
                Tier 02
              </span>
              <h3 className="text-4xl font-black mt-4 mb-2 tracking-tighter">Established</h3>
              <p className="text-sm mb-12" style={{ color: 'var(--on-surface-variant)' }}>
                Businesses with $2M - $10M EBITDA
              </p>
              <div className="mb-12">
                <div className="text-[48px] md:text-[64px] font-extrabold tracking-tighter leading-none mb-2">2.5%</div>
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--tertiary)' }}>
                  Success Fee
                </p>
              </div>
              <ul className="space-y-6 mb-16 text-sm flex-grow list-none p-0">
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Institutional Quality CIM Production</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Full Financial Normalization Support</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Targeted Private Equity Outreach</span>
                </li>
              </ul>
              <button
                onClick={() => onChipClick('See for yourself')}
                className="w-full bg-black text-white py-4 font-bold text-sm hover:opacity-90 transition-all"
              >
                Select Tier
              </button>
            </div>

            {/* Card 3: Mid-Market */}
            <div className="group py-16 px-8 flex flex-col hover:bg-white transition-colors">
              <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--on-surface-variant-60)' }}>
                Tier 03
              </span>
              <h3 className="text-4xl font-black mt-4 mb-2 tracking-tighter">Mid-Market</h3>
              <p className="text-sm mb-12" style={{ color: 'var(--on-surface-variant)' }}>
                Businesses with $10M+ EBITDA
              </p>
              <div className="mb-12">
                <div className="text-[48px] md:text-[64px] font-extrabold tracking-tighter leading-none mb-2">1.8%</div>
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--tertiary)' }}>
                  Success Fee
                </p>
              </div>
              <ul className="space-y-6 mb-16 text-sm flex-grow list-none p-0">
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>White-Glove Transaction Advisory</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Global Strategic Buyer Access</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Custom Legal &amp; Tax Structuring</span>
                </li>
              </ul>
              <button
                onClick={() => onChipClick('See for yourself')}
                className="w-full border border-black py-4 font-bold text-sm hover:bg-black hover:text-white transition-all"
              >
                Select Tier
              </button>
            </div>
          </div>
        </section>

        {/* Asymmetric Detail Section */}
        <section className="mb-40 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
              <img
                className="w-full h-full object-cover grayscale"
                alt="Architecture detail of a high-end modern building facade"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAZv2cIW-sLoKtRfiX8Kmmt7ARV8ZHZdCyeZIGzYexA95YzihlTxBzTn4rmp194pPjF_u4yph9F1mxK3uRKpfJx2ebjzN2Ji_wIyD5djOvQ7FUo0DaxL5Q0C27GtINl917nrafNVebTQYeOe223VVhwsnvrkYIXZI0PRMNNupsyqP6UY0F1Gp2_sVFSHVrF5i5u7irkgAh4kQn6Ojv7tmhuRVaMPlWoj6dfAMwFlejQhH8VfsNEjGm2keBExvjTiGY_iY-AbmegNk"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
          <div className="md:col-span-5 md:pl-12">
            <h2 className="text-4xl font-bold tracking-tight mb-8">Precision-Engineered Exits.</h2>
            <p className="leading-[1.8] mb-8" style={{ color: 'var(--on-surface-variant)' }}>
              Traditional investment banking fees are often opaque and misaligned. By leveraging AI to automate the heavy lifting of data normalization and teaser generation, we pass the efficiency directly to you. No retainers. No hidden costs.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 py-4" style={{ borderBottom: '1px solid rgba(219, 193, 186, 0.2)' }}>
                <span className="text-2xl font-bold" style={{ color: 'var(--tertiary)' }}>01</span>
                <span className="font-medium">No engagement retainers</span>
              </div>
              <div className="flex items-center gap-4 py-4" style={{ borderBottom: '1px solid rgba(219, 193, 186, 0.2)' }}>
                <span className="text-2xl font-bold" style={{ color: 'var(--tertiary)' }}>02</span>
                <span className="font-medium">No marketing overhead fees</span>
              </div>
              <div className="flex items-center gap-4 py-4" style={{ borderBottom: '1px solid rgba(219, 193, 186, 0.2)' }}>
                <span className="text-2xl font-bold" style={{ color: 'var(--tertiary)' }}>03</span>
                <span className="font-medium">Direct alignment with exit value</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
