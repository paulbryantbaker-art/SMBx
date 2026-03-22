import { useEffect } from 'react';

interface SellBelowProps {
  onChipClick: (text: string) => void;
}

export default function SellBelow({ onChipClick }: SellBelowProps) {
  useEffect(() => {
    // Load Inter font and Material Symbols if not already present
    const fontId = 'stitch-sell-fonts';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap';
      document.head.appendChild(link);
    }
    const iconId = 'stitch-sell-icons';
    if (!document.getElementById(iconId)) {
      const link = document.createElement('link');
      link.id = iconId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="stitch-sell">
      {/* Scoped style block for custom Stitch/Material Design 3 color utilities */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .editorial-shadow {
          box-shadow: 0 10px 30px -10px rgba(26, 28, 28, 0.04);
        }
        .text-editorial-body {
          line-height: 1.6;
        }
        .zig-zag-container > div:nth-child(even) {
          flex-direction: row-reverse;
        }

        /* ── Scoped color utilities ── */
        .stitch-sell .text-on-surface { color: #1a1c1c; }
        .stitch-sell .bg-on-surface { background-color: #1a1c1c; }
        .stitch-sell .border-on-surface { border-color: #1a1c1c; }

        .stitch-sell .text-surface { color: #f9f9f9; }
        .stitch-sell .bg-surface { background-color: #f9f9f9; }
        .stitch-sell .border-surface { border-color: #f9f9f9; }

        .stitch-sell .text-tertiary { color: #95432b; }
        .stitch-sell .bg-tertiary { background-color: #95432b; }
        .stitch-sell .border-tertiary { border-color: #95432b; }
        .stitch-sell .border-tertiary\\/20 { border-color: rgba(149, 67, 43, 0.2); }
        .stitch-sell .selection\\:bg-tertiary\\/20 ::selection { background-color: rgba(149, 67, 43, 0.2); }

        .stitch-sell .text-on-surface-variant { color: #55433d; }
        .stitch-sell .bg-on-surface-variant { background-color: #55433d; }

        .stitch-sell .text-surface-container-lowest { color: #ffffff; }
        .stitch-sell .bg-surface-container-lowest { background-color: #ffffff; }

        .stitch-sell .text-surface-container-low { color: #f3f3f3; }
        .stitch-sell .bg-surface-container-low { background-color: #f3f3f3; }

        .stitch-sell .bg-surface-container { background-color: #eeeeee; }
        .stitch-sell .bg-surface-container-high { background-color: #e8e8e8; }
        .stitch-sell .bg-surface-container-highest { background-color: #e2e2e2; }

        .stitch-sell .text-primary { color: #5c5c5c; }
        .stitch-sell .bg-primary { background-color: #5c5c5c; }

        .stitch-sell .text-error { color: #ba1a1a; }
        .stitch-sell .bg-error { background-color: #ba1a1a; }

        .stitch-sell .border-outline-variant { border-color: #dbc1ba; }
        .stitch-sell .border-outline-variant\\/20 { border-color: rgba(219, 193, 186, 0.2); }
        .stitch-sell .border-outline-variant\\/10 { border-color: rgba(219, 193, 186, 0.1); }
        .stitch-sell .bg-outline-variant\\/30 { background-color: rgba(219, 193, 186, 0.3); }

        .stitch-sell .text-inverse-surface { color: #2f3131; }
        .stitch-sell .bg-inverse-surface { background-color: #2f3131; }

        .stitch-sell .divide-outline-variant\\/10 > :not([hidden]) ~ :not([hidden]) {
          border-color: rgba(219, 193, 186, 0.1);
        }

        /* Font families */
        .stitch-sell .font-headline { font-family: 'Inter', sans-serif; }
        .stitch-sell .font-body { font-family: 'Inter', sans-serif; }
        .stitch-sell .font-label { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-60 pb-40 px-12 max-w-[1400px] mx-auto">
        <div className="max-w-4xl">
          <span className="text-tertiary font-label text-[11px] font-bold tracking-[0.2em] mb-8 block">
            THE EXIT ADVISOR
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] text-on-surface mb-12">
            75% of owners who sell their business profoundly regret it within a year.
          </h1>
          <p className="text-2xl text-on-surface-variant max-w-2xl text-editorial-body">
            We architect exits that preserve legacy, maximize liquid wealth, and eliminate the
            &quot;Seller&apos;s Remorse&quot; trap through editorial precision and AI-driven
            valuation.
          </p>
        </div>
      </section>

      {/* ValueLens Data Viz */}
      <section className="my-[160px] px-12 max-w-[1400px] mx-auto">
        <div className="bg-surface-container-lowest p-16 editorial-shadow rounded-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-8">
                The ValueLens&trade; Discovery
              </h2>
              <p className="text-lg text-on-surface-variant text-editorial-body mb-8">
                Traditional valuation ignores the narrative power of your business. We look through a
                multi-dimensional lens to find hidden equity that typical brokers miss.
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="font-medium text-primary">Operational Efficiency</span>
                  <span className="font-bold text-tertiary">92%</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="font-medium text-primary">Market Dominance</span>
                  <span className="font-bold text-tertiary">78%</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <span className="font-medium text-primary">Scalability Index</span>
                  <span className="font-bold text-tertiary">84%</span>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] flex items-center justify-center">
              {/* Abstract Data Visualization */}
              <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-low to-transparent rounded-full border border-outline-variant/10" />
              <div className="relative w-64 h-64 border-4 border-tertiary rounded-full flex items-center justify-center animate-pulse">
                <span className="text-5xl font-black text-on-surface">14.2x</span>
              </div>
              <div className="absolute top-10 left-10 p-4 bg-surface rounded-lg shadow-sm border border-outline-variant/20">
                <span className="block text-[10px] font-bold tracking-widest uppercase opacity-50">
                  Sector Avg
                </span>
                <span className="text-xl font-bold">6.5x</span>
              </div>
              <div className="absolute bottom-10 right-10 p-4 bg-white rounded-lg shadow-xl border border-tertiary/20">
                <span className="block text-[10px] font-bold tracking-widest uppercase text-tertiary">
                  smbx Target
                </span>
                <span className="text-xl font-bold">14.2x</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zig-Zag Editorial: Narrative Flow */}
      <section className="my-[160px] px-12 max-w-[1400px] mx-auto flex flex-col gap-40 zig-zag-container">
        {/* Phase 1 */}
        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2">
            <img
              className="w-full h-[600px] object-cover rounded-xl filter grayscale contrast-125"
              alt="Minimalist architectural office space with natural lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbWK5OD1yr638828cPTmc9-7p1zdBdHTMcXw_jvqcxKk21AVupeXsv9pvhGAgSc77HXHiAtQ3J_4fpLCK2ujNcYJqO_jML3jGoyFP_EyKrW_Stcrbzr74qV1x72V6XAJk3tKDzFfQEqsho9cbNNrlvGh7kSqY-uk2B0co1Ap7Z7BQyLkD7gxP6aZ96usCCnaFyAmyWcdatf5j_da1eL8ppHgVHRLjuRz3lr5KMj-mcADCktzMNHUAdWSktEa85Ye1KRyh0-6stk5k"
            />
          </div>
          <div className="w-full md:w-1/2">
            <span className="text-tertiary font-label text-[11px] font-bold tracking-[0.2em] mb-6 block">
              01 / DISCOVERY
            </span>
            <h3 className="text-5xl font-bold tracking-tighter mb-8">Beyond the Balance Sheet.</h3>
            <p className="text-xl text-on-surface-variant text-editorial-body">
              Your business is more than numbers. It&apos;s a culture, a brand, and a set of
              proprietary workflows. Our &quot;Editorial Architects&quot; interview your key leaders
              to extract the intrinsic value that isn&apos;t reflected in your EBITDA.
            </p>
          </div>
        </div>
        {/* Phase 2 */}
        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2">
            <img
              className="w-full h-[600px] object-cover rounded-xl filter grayscale contrast-125"
              alt="Modern high-end glass office boardroom table"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2WMuVklRyLxyTy87FdmLlpgJ_uED-DGbcGY9dwAwGk3tTDr3-6S6dzPnH1g-ShhL7GTxcTGnHLnrYHekkyWYX_7WANsGcm4bPVnRyuok3LNxxDB2x_ooxe3lX4WXXUw76dwXqhxZQ5Df5lJeDvov9qnm_Kh_fxumCZpgJSXgK4dNcesKvvqL3BQYHu80dlu8_XLIcn77L48nI6oRkyPkTrbNmyqkhfzwPQd9lfp2F9dTt0695MlNMgyNkD8KMbRiJghbea43WSQs"
            />
          </div>
          <div className="w-full md:w-1/2">
            <span className="text-tertiary font-label text-[11px] font-bold tracking-[0.2em] mb-6 block">
              02 / CURATION
            </span>
            <h3 className="text-5xl font-bold tracking-tighter mb-8">Strategic Positioning.</h3>
            <p className="text-xl text-on-surface-variant text-editorial-body">
              We don&apos;t just &quot;list&quot; your business; we curate an investment memorandum
              that reads like a premium publication. We target strategic buyers who value your
              synergy, not just your cash flow.
            </p>
          </div>
        </div>
      </section>

      {/* Add-Back Discovery Table */}
      <section className="my-[160px] px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black tracking-tight mb-4">Add-back Discovery</h2>
          <p className="text-on-surface-variant">
            Uncovering legitimate expenses that artificially depress your valuation.
          </p>
        </div>
        <div className="overflow-hidden bg-surface-container-lowest editorial-shadow rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-on-surface text-surface-container-lowest">
                <th className="py-6 px-8 font-bold text-sm tracking-widest uppercase">Category</th>
                <th className="py-6 px-8 font-bold text-sm tracking-widest uppercase">
                  Typical Adjustment
                </th>
                <th className="py-6 px-8 font-bold text-sm tracking-widest uppercase">
                  smbx.ai Impact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              <tr>
                <td className="py-6 px-8 font-bold">Owner&apos;s Excess Salary</td>
                <td className="py-6 px-8 text-on-surface-variant">$120,000</td>
                <td className="py-6 px-8 text-tertiary font-bold">+$1.2M Exit Value</td>
              </tr>
              <tr>
                <td className="py-6 px-8 font-bold">Non-recurring Legal Fees</td>
                <td className="py-6 px-8 text-on-surface-variant">$45,000</td>
                <td className="py-6 px-8 text-tertiary font-bold">+$450k Exit Value</td>
              </tr>
              <tr>
                <td className="py-6 px-8 font-bold">Discretionary Travel/Perks</td>
                <td className="py-6 px-8 text-on-surface-variant">$85,000</td>
                <td className="py-6 px-8 text-tertiary font-bold">+$850k Exit Value</td>
              </tr>
              <tr className="bg-surface-container-low">
                <td className="py-6 px-8 font-black">Total Equity Recaptured</td>
                <td className="py-6 px-8" />
                <td className="py-6 px-8 text-on-surface text-2xl font-black">+$2.5M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Six Exit Types Grid */}
      <section className="my-[160px] py-32 bg-surface-container-low">
        <div className="px-12 max-w-[1400px] mx-auto">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-5xl font-black tracking-tighter mb-6">Six Exit Types.</h2>
            <p className="text-on-surface-variant text-lg">
              Every founder has a different destination. We architect the path that matches your
              personal &apos;Chapter Two&apos;.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-10 rounded-none border-l-4 border-tertiary editorial-shadow hover:-translate-y-2 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-tertiary mb-6"
                style={{ fontSize: 32 }}
              >
                rocket_launch
              </span>
              <h4 className="text-xl font-bold mb-4">Strategic Buyout</h4>
              <p className="text-on-surface-variant text-sm text-editorial-body">
                Maximize exit value by selling to a competitor or market leader looking for your
                specific IP.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-10 rounded-none border-l-4 border-on-surface editorial-shadow hover:-translate-y-2 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-on-surface mb-6"
                style={{ fontSize: 32 }}
              >
                groups
              </span>
              <h4 className="text-xl font-bold mb-4">ESOP Transition</h4>
              <p className="text-on-surface-variant text-sm text-editorial-body">
                Preserve your legacy by selling the company back to the employees who helped build
                it.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white p-10 rounded-none border-l-4 border-on-surface editorial-shadow hover:-translate-y-2 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-on-surface mb-6"
                style={{ fontSize: 32 }}
              >
                account_balance
              </span>
              <h4 className="text-xl font-bold mb-4">Private Equity</h4>
              <p className="text-on-surface-variant text-sm text-editorial-body">
                Take some chips off the table while remaining as a minority shareholder for the
                &quot;second bite.&quot;
              </p>
            </div>
            {/* Card 4 */}
            <div className="bg-white p-10 rounded-none border-l-4 border-on-surface editorial-shadow hover:-translate-y-2 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-on-surface mb-6"
                style={{ fontSize: 32 }}
              >
                family_restroom
              </span>
              <h4 className="text-xl font-bold mb-4">Family Succession</h4>
              <p className="text-on-surface-variant text-sm text-editorial-body">
                Structured transition to the next generation with tax-efficient wealth transfer.
              </p>
            </div>
            {/* Card 5 */}
            <div className="bg-white p-10 rounded-none border-l-4 border-on-surface editorial-shadow hover:-translate-y-2 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-on-surface mb-6"
                style={{ fontSize: 32 }}
              >
                merge
              </span>
              <h4 className="text-xl font-bold mb-4">M&amp;A Merger</h4>
              <p className="text-on-surface-variant text-sm text-editorial-body">
                Combine forces with a complementary entity to create a powerhouse and share future
                upside.
              </p>
            </div>
            {/* Card 6 */}
            <div className="bg-white p-10 rounded-none border-l-4 border-on-surface editorial-shadow hover:-translate-y-2 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-on-surface mb-6"
                style={{ fontSize: 32 }}
              >
                speed
              </span>
              <h4 className="text-xl font-bold mb-4">Management Buyout</h4>
              <p className="text-on-surface-variant text-sm text-editorial-body">
                Empower your current management team to take the reins through seller financing
                structures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deal Structure Comparison */}
      <section className="my-[160px] px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="bg-surface-container-low p-12 rounded-xl">
            <h3 className="text-3xl font-bold mb-8">Standard Broker Deal</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-error">close</span>
                <span className="text-on-surface-variant">
                  80% Cash / 20% Contingent Earn-out
                </span>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-error">close</span>
                <span className="text-on-surface-variant">
                  24-month restrictive non-compete
                </span>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-error">close</span>
                <span className="text-on-surface-variant">
                  Low visibility on buyer&apos;s operational intent
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-on-surface text-white p-12 rounded-xl border-4 border-tertiary">
            <h3 className="text-3xl font-bold mb-8">smbx.ai Architected Deal</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <span
                  className="material-symbols-outlined text-tertiary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span>95% Guaranteed Liquidity at close</span>
              </li>
              <li className="flex gap-4">
                <span
                  className="material-symbols-outlined text-tertiary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span>Customized &quot;Advisory Role&quot; transition</span>
              </li>
              <li className="flex gap-4">
                <span
                  className="material-symbols-outlined text-tertiary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span>Protective covenants for existing employees</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Four Phases Vertical Timeline */}
      <section className="my-[160px] px-12 max-w-[1000px] mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-black tracking-tight">The Exit Roadmap</h2>
        </div>
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant/30 -translate-x-1/2 hidden md:block" />
          <div className="space-y-32">
            {/* Phase 1 */}
            <div className="relative flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 md:text-right">
                <span className="text-tertiary font-bold tracking-widest text-sm uppercase">
                  Phase 01
                </span>
                <h4 className="text-2xl font-bold mt-2">Audit &amp; Forensics</h4>
                <p className="text-on-surface-variant mt-4 text-editorial-body">
                  We perform a deep-tissue audit to fix red flags before buyers ever see them.
                </p>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-on-surface border-4 border-surface hidden md:block" />
              <div className="w-full md:w-1/2" />
            </div>
            {/* Phase 2 */}
            <div className="relative flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2" />
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-on-surface border-4 border-surface hidden md:block" />
              <div className="w-full md:w-1/2">
                <span className="text-tertiary font-bold tracking-widest text-sm uppercase">
                  Phase 02
                </span>
                <h4 className="text-2xl font-bold mt-2">Narrative Packaging</h4>
                <p className="text-on-surface-variant mt-4 text-editorial-body">
                  Creating the &quot;Masterpiece&quot; Prospectus that justifies your premium
                  multiple.
                </p>
              </div>
            </div>
            {/* Phase 3 */}
            <div className="relative flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 md:text-right">
                <span className="text-tertiary font-bold tracking-widest text-sm uppercase">
                  Phase 03
                </span>
                <h4 className="text-2xl font-bold mt-2">Auction Dynamics</h4>
                <p className="text-on-surface-variant mt-4 text-editorial-body">
                  Creating competitive tension among qualified strategic buyers.
                </p>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-on-surface border-4 border-surface hidden md:block" />
              <div className="w-full md:w-1/2" />
            </div>
            {/* Phase 4 */}
            <div className="relative flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2" />
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-on-surface border-4 border-surface hidden md:block" />
              <div className="w-full md:w-1/2">
                <span className="text-tertiary font-bold tracking-widest text-sm uppercase">
                  Phase 04
                </span>
                <h4 className="text-2xl font-bold mt-2">Final Settlement</h4>
                <p className="text-on-surface-variant mt-4 text-editorial-body">
                  Closing the deal, wiring the funds, and executing the transition plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-[200px] mb-20 px-12 max-w-[1400px] mx-auto">
        <div className="bg-on-surface p-24 text-center rounded-none relative overflow-hidden">
          {/* Decorative interlocked 'X' in Coral Red */}
          <div className="absolute top-0 right-0 opacity-10 translate-x-1/3 -translate-y-1/3">
            <span className="text-[400px] font-black leading-none text-tertiary select-none">
              X
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-12 relative z-10">
            Your legacy is worth more than a multiple.
          </h2>
          <button
            onClick={() => onChipClick('Tell Yulia about your business')}
            className="bg-tertiary text-white text-xl font-bold px-12 py-6 rounded-none hover:scale-105 transition-all relative z-10 cursor-pointer"
          >
            Tell Yulia about your business
          </button>
        </div>
      </section>
    </div>
  );
}
