interface IntegrateBelowProps {
  onChipClick: (text: string) => void;
}

export default function IntegrateBelow({ onChipClick }: IntegrateBelowProps) {
  return (
    <div className="stitch-integrate">
      <style>{`
        .stitch-integrate {
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
          color: var(--on-surface);
          background-color: var(--surface);
          font-family: 'Inter', sans-serif;
        }
        .stitch-integrate .ghost-border {
          border: 1px solid rgba(219, 193, 186, 0.2);
        }
        .stitch-integrate .editorial-shadow {
          box-shadow: 0 10px 24px -12px rgba(26, 28, 28, 0.04);
        }
        .stitch-integrate .text-tertiary {
          color: var(--tertiary);
        }
        .stitch-integrate .text-on-surface {
          color: var(--on-surface);
        }
        .stitch-integrate .text-on-surface-variant {
          color: var(--on-surface-variant);
        }
        .stitch-integrate .bg-surface-container-low {
          background-color: var(--surface-container-low);
        }
        .stitch-integrate .bg-surface-container-lowest {
          background-color: var(--surface-container-lowest);
        }
        .stitch-integrate .bg-surface-container-highest {
          background-color: var(--surface-container-highest);
        }
        .stitch-integrate .bg-surface-container {
          background-color: var(--surface-container);
        }
        .stitch-integrate .border-surface-container {
          border-color: var(--surface-container);
        }
        .stitch-integrate .bg-outline-variant {
          background-color: var(--outline-variant);
        }
      `}</style>

      {/* Hero Section: Editorial Architecture */}
      <section className="max-w-[1440px] mx-auto px-12 pt-[150px] pb-[200px]">
        <div className="max-w-4xl">
          <span className="label-sm text-tertiary font-bold tracking-[0.05em] uppercase text-[11px] mb-6 block">
            Integrate / The Post-Deal Engine
          </span>
          <h1 className="text-black text-[64px] font-extrabold leading-[1.1] tracking-tighter mb-12">
            70% of acquisitions fail to deliver the returns that justified the price.
          </h1>
          <p className="text-on-surface-variant text-[16px] leading-[1.6] max-w-2xl">
            Integration is where value is either realized or lost. SMBX.ai transforms the chaotic post-closing period into a structured architectural process through Yulia AI's 180-Day Execution Engine.
          </p>
          <div className="mt-12">
            <button
              onClick={() => onChipClick('Tell Yulia about your acquisition')}
              className="bg-black text-white px-10 py-5 font-bold tracking-tight hover:bg-[#C96B4F] transition-all"
            >
              Tell Yulia about your acquisition
            </button>
          </div>
        </div>
      </section>

      {/* The Timeline: Rhythmic Zig-Zag */}
      <section className="bg-surface-container-low py-[200px]">
        <div className="max-w-[1200px] mx-auto px-12 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant opacity-20 hidden lg:block" />

          {/* Phase 1: Stabilize */}
          <div className="flex flex-col lg:flex-row items-center mb-[180px] group">
            <div className="w-full lg:w-1/2 lg:pr-24 flex justify-end">
              <div className="bg-surface-container-lowest p-11 rounded-xl ghost-border editorial-shadow max-w-md transition-transform duration-500 hover:-translate-y-2">
                <span className="text-tertiary font-bold label-sm block mb-4">PHASE 01 (DAYS 1-60)</span>
                <h3 className="text-black text-3xl font-bold mb-6 tracking-tight">Stabilize</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Immediate focus on culture, payroll continuity, and customer retention. Yulia AI audits all operational workflows to identify &ldquo;Day 1&rdquo; risks before they become liabilities.
                </p>
                <div className="mt-8 pt-8 border-t border-surface-container flex items-center gap-4">
                  <span className="material-symbols-outlined text-tertiary" data-icon="verified_user">verified_user</span>
                  <span className="text-sm font-medium">Risk Mitigation Framework</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex w-16 h-16 bg-black rounded-full items-center justify-center text-white z-10 -ml-8">01</div>
            <div className="w-full lg:w-1/2 lg:pl-24 mt-8 lg:mt-0">
              <div className="w-full h-64 bg-surface-container-highest rounded-lg relative overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale opacity-80"
                  alt="Abstract architectural lines showing stability and structure"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfbEi0zSkflWD-MkkqzgdFaav5E6IC0b4Snp_cqwMmTCWHk56iLyTfaFasNsMmfSiQr71T3u6m5WGvqdVde7bl_J6l1D5RSi-uWBoHCHTDLtvBE4dgArDj8RbF-JJkOqqg3O8YHBEQu5aRcQ5gIrrw2PmVTLCl74Pm4iBszA2hPuS0wxTaijBqe9DwTHfdF244zLIiURpxQQOoHjfpe9UYiUewIsUrguPbNCKrGv8Fy5DjW14azDgpnaYyf2KjloVsYHa0qAW793c"
                />
              </div>
            </div>
          </div>

          {/* Phase 2: Optimize */}
          <div className="flex flex-col lg:flex-row-reverse items-center mb-[180px] group">
            <div className="w-full lg:w-1/2 lg:pl-24">
              <div className="bg-surface-container-lowest p-11 rounded-xl ghost-border editorial-shadow max-w-md transition-transform duration-500 hover:-translate-y-2">
                <span className="text-tertiary font-bold label-sm block mb-4">PHASE 02 (DAYS 61-120)</span>
                <h3 className="text-black text-3xl font-bold mb-6 tracking-tight">Optimize</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Tech-stack consolidation and cost-efficiency protocols. We remove redundancies and align the new asset&apos;s operations with your core platform&apos;s scaling architecture.
                </p>
                <div className="mt-8 pt-8 border-t border-surface-container flex items-center gap-4">
                  <span className="material-symbols-outlined text-tertiary" data-icon="bolt">bolt</span>
                  <span className="text-sm font-medium">Efficiency Engine Mapping</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex w-16 h-16 bg-black rounded-full items-center justify-center text-white z-10 -mr-8">02</div>
            <div className="w-full lg:w-1/2 lg:pr-24 mt-8 lg:mt-0 flex justify-end">
              <div className="w-full h-64 bg-surface-container-highest rounded-lg relative overflow-hidden max-w-md">
                <img
                  className="w-full h-full object-cover grayscale opacity-80"
                  alt="Abstract motion blur representing speed and optimization"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFdbpqgQi-yPBcs4ejLewcWuPecjurPiry5yMpJIZPJWIYu4NICrDrbjCGtOYWUA_5c1qzzurv_TUYNgPmZvwUprXddDpAhjSoe43F5HX7hLvCsO5rDhRhtYzAa5vhM9JYAIrExqoY_kczAS9GJ9bAgsNrb5wDAO05ZtLhXVTQ4QUtuy2kfjRgZzfabGewo1ZhzT3xj_XSBZUw4rMVc9uCW8qmbozJ5lRB8jULS1TdZvcK1RpthalQx0lawYx0n6Tu64hiLKTBdeE"
                />
              </div>
            </div>
          </div>

          {/* Phase 3: Grow */}
          <div className="flex flex-col lg:flex-row items-center group">
            <div className="w-full lg:w-1/2 lg:pr-24 flex justify-end">
              <div className="bg-surface-container-lowest p-11 rounded-xl ghost-border editorial-shadow max-w-md transition-transform duration-500 hover:-translate-y-2">
                <span className="text-tertiary font-bold label-sm block mb-4">PHASE 03 (DAYS 121-180)</span>
                <h3 className="text-black text-3xl font-bold mb-6 tracking-tight">Grow</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Shifting from defense to offense. Implementation of cross-selling strategies and expansion playbooks. The asset is now fully integrated and ready for accelerated output.
                </p>
                <div className="mt-8 pt-8 border-t border-surface-container flex items-center gap-4">
                  <span className="material-symbols-outlined text-tertiary" data-icon="trending_up">trending_up</span>
                  <span className="text-sm font-medium">Scale Multiplier Active</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex w-16 h-16 bg-black rounded-full items-center justify-center text-white z-10 -ml-8">03</div>
            <div className="w-full lg:w-1/2 lg:pl-24 mt-8 lg:mt-0">
              <div className="w-full h-64 bg-surface-container-highest rounded-lg relative overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale opacity-80"
                  alt="Abstract upward architectural perspective representing growth"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5lyjRcVUeS9s1OBq8dhZnIOB3SxemWA5Aj-G9CYtcd3bSTuX4MiVgSRb_hg209T2SpEV3okKVPnl-JTgDkHr8tgDE8fB-2SV-N4hXypRlPskIDaJ63TfcZmQVnP8HvDtwPaBE7a1rpMQQuCkfpEbO6guGzyU9XVTfJbHXBcn14EDM3vFd_cNmECiUCRijcVtEHswjV9l-Igsuv2ZGwBRGQDOavlseQAZzTqwRMWea37pwt4mDQKIte31pMpaGOXQen_f7J0OACqw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote/Editorial Block */}
      <section className="max-w-[1440px] mx-auto px-12 py-[200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
          <div>
            <h2 className="text-black text-[40px] font-bold tracking-tighter leading-tight mb-8">The smbx.ai Standard</h2>
            <p className="text-on-surface-variant text-lg leading-loose mb-8">
              Traditional M&amp;A firms hand you a report and leave. We provide the editorial architect &mdash; Yulia AI &mdash; who stays through the entire 180-day journey, ensuring every brick of the integration is laid with precision.
            </p>
            <div className="p-8 border-l-4 border-[#C96B4F] bg-surface-container-low">
              <p className="italic text-on-surface text-xl">&ldquo;Integration is not a checklist; it&apos;s a narrative transformation.&rdquo;</p>
            </div>
          </div>
          <div className="aspect-square bg-surface-container-highest relative">
            <img
              className="w-full h-full object-cover grayscale"
              alt="Minimalist designer office with high-end furniture"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxbn022IUjJRQHvmv9AR581Wd_ytdrKwKqO3GLryjBa2VLjYycziHchUtc7v2jiks6-IDkjFc3UqHMvnWXCTA3YXzMAQPOT__Ay5SnanRnK2mbtvEx5qzIpR6i5ahqxPkFye39Q2LpU9NMowv6NcEoZpc8umyfrHgwT1MCEZtuNCT8tMGYwVeadU90Wi-x7YvHLjatkZTY1uve9xpb4pSNQAgE8gWQEsto91GAC_DANDvH3qycZ87PLtvd-DbqSz0FMT5oTMfrc2Q"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-black py-[120px] text-white">
        <div className="max-w-[1440px] mx-auto px-12 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">Ready to secure the returns?</h2>
          <button
            onClick={() => onChipClick('Tell Yulia about your acquisition')}
            className="bg-[#C96B4F] text-white px-12 py-6 text-xl font-bold hover:bg-white hover:text-black transition-all"
          >
            Tell Yulia about your acquisition
          </button>
        </div>
      </section>
    </div>
  );
}
