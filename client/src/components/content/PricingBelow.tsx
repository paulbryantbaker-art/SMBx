interface PricingBelowProps {
  onChipClick: (text: string) => void;
}

export default function PricingBelow({ onChipClick }: PricingBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: FREE ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-4" style={{ letterSpacing: '-0.04em' }}>
            These are free. Not &ldquo;free trial&rdquo; free. Free forever.
          </h2>
          <div className="space-y-6 mt-10">
            {[
              { title: 'Bizestimate', desc: 'Your business valuation range \u2014 updated quarterly as market conditions change. Shareable.' },
              { title: 'Value Readiness Report', desc: '7-factor score with specific improvement actions and dollar-impact estimates.' },
              { title: 'Investment Thesis Document', desc: 'Acquisition blueprint with criteria, SBA eligibility, and market landscape.' },
              { title: 'Preliminary SDE/EBITDA', desc: 'The add-back math and adjusted earnings foundation.' },
            ].map(item => (
              <div key={item.title} className="bg-[#F9FAFB] px-6 md:px-8 py-5" style={{ borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                <h3 className="text-[16px] md:text-[18px] font-bold text-[#1A1A18] m-0 mb-1">{item.title}</h3>
                <p className="text-[14px] md:text-[15px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#F9FAFB] mt-6 p-6" style={{ borderRadius: '16px', border: '1px solid #F3F4F6' }}>
            <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>
              Plus: unlimited conversation with Yulia, deal classification, SBA screening, process guidance, exit option analysis, and broker recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: TIER 1 ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">GO DEEPER WHEN YOU&apos;RE READY</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-10" style={{ letterSpacing: '-0.04em' }}>
            Know your position.
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Business Valuation Report', price: '$350', desc: 'Multi-methodology analysis with comps, multiples, and local market data. Defensible at the closing table.' },
              { title: 'Market Intelligence Report', price: '$200', desc: 'Competitive landscape, regional economics, PE activity, industry benchmarks \u2014 localized to your MSA.' },
              { title: 'Deal Screening Memo', price: '$150', desc: 'Pursue or pass? Financial validation, risk flags, and a clear recommendation for any target you\u2019re evaluating.' },
              { title: 'Target Valuation', price: '$350', desc: 'What should you actually pay? Comparable transactions, industry multiples, and the fair value range.' },
              { title: 'SBA Financing Model', price: '$200', desc: 'Down payment, monthly payment, DSCR, cash-on-cash \u2014 modeled at live rates. Know if it\u2019s bankable.' },
              { title: 'Reality Check', price: '$150', desc: 'Quick-turn sanity check on any aspect of your deal \u2014 pricing, timing, structure, risk.' },
            ].map(item => (
              <div key={item.title} className="flex items-start justify-between bg-[#F9FAFB] px-6 md:px-8 py-5" style={{ borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-[16px] md:text-[18px] font-bold text-[#1A1A18] m-0 mb-1">{item.title}</h3>
                  <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{item.desc}</p>
                </div>
                <span className="text-[20px] md:text-[24px] font-black text-[#D4714E] shrink-0">{item.price}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[#6E6A63] mt-4 m-0 italic">Prices shown are L1/L2. Larger deals scale proportionally.</p>
        </div>
      </section>

      {/* ═══ Section 3: TIER 2 ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PREPARE TO TRANSACT</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-10" style={{ letterSpacing: '-0.04em' }}>
            Documents that close deals.
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Confidential Information Memo', price: '$700', desc: '25+ page presentation of your business to qualified buyers. Professional. Data-backed. The document that starts your deal process.' },
              { title: 'Living CIM (auto-updates)', price: '$900', desc: 'Your CIM stays current when financials change. Version-controlled. Always ready to distribute.' },
              { title: 'Full Valuation Suite (bundle)', price: '$500', desc: 'Valuation + Market Intel + SBA Feasibility \u2014 bundled together. Save ~$250 vs. individual.' },
              { title: 'QoE Lite', price: '$500', desc: 'Pre-QoE gap analysis. See what a Quality of Earnings firm will find \u2014 before you pay for one.' },
            ].map(item => (
              <div key={item.title} className="flex items-start justify-between bg-[#F9FAFB] px-6 md:px-8 py-5" style={{ borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-[16px] md:text-[18px] font-bold text-[#1A1A18] m-0 mb-1">{item.title}</h3>
                  <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{item.desc}</p>
                </div>
                <span className="text-[20px] md:text-[24px] font-black text-[#D4714E] shrink-0">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 4: PROGRESSIVE REVEAL ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-8 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
          <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
            More analysis unlocks as your deal progresses.
          </p>
          <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] m-0 mt-4" style={{ lineHeight: 1.65 }}>
            Yulia introduces additional tools &mdash; LOI drafts, negotiation strategy, due diligence checklists, deal structure analysis, closing documents &mdash; at exactly the moment you need them.
          </p>
          <p className="text-[18px] md:text-[20px] font-medium text-[#1A1A18] font-bold m-0 mt-4" style={{ lineHeight: 1.65 }}>
            You won&apos;t see a menu of 24 items when you&apos;re just starting out. You&apos;ll see the next right thing &mdash; priced for the stage of the deal you&apos;re in.
          </p>
        </div>
      </section>

      {/* ═══ Section 5: WALLET ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-4" style={{ letterSpacing: '-0.04em' }}>
            Fund your wallet. Spend as you go.
          </h2>
          <div className="text-[18px] font-medium text-[#6E6A63] space-y-4 mb-10" style={{ lineHeight: 1.6 }}>
            <p className="m-0">No monthly fees. No seat licenses. No surprise invoices.</p>
            <p className="m-0">Every purchase is a specific decision at a specific moment in your deal &mdash; not a subscription to something you might use someday.</p>
          </div>

          {/* Wallet blocks table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
              <thead>
                <tr className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#6E6A63]">
                  <th className="py-2 px-4 font-bold">Amount</th>
                  <th className="py-2 px-4 font-bold">Bonus</th>
                  <th className="py-2 px-4 font-bold">Total</th>
                  <th className="py-2 px-4 font-bold">Best For</th>
                </tr>
              </thead>
              <tbody className="text-[14px] md:text-[15px] font-medium">
                {[
                  { amount: '$50', bonus: '\u2014', total: '$50', use: 'Exploratory' },
                  { amount: '$100', bonus: '+$5', total: '$105', use: 'Early commit' },
                  { amount: '$250', bonus: '+$15', total: '$265', use: 'Active deal', pop: true },
                  { amount: '$500', bonus: '+$40', total: '$540', use: 'Serious seller/buyer' },
                  { amount: '$1,000', bonus: '+$100', total: '$1,100', use: 'Full deal journey' },
                  { amount: '$2,500', bonus: '+$300', total: '$2,800', use: 'Advisor with clients' },
                ].map(row => (
                  <tr key={row.amount} className={row.pop ? 'bg-[#D4714E] text-white rounded-xl' : 'bg-[#F9FAFB]'} style={{ borderRadius: '12px' }}>
                    <td className="py-3 px-4 font-bold" style={{ borderRadius: '12px 0 0 12px' }}>{row.amount}</td>
                    <td className="py-3 px-4">{row.bonus}</td>
                    <td className="py-3 px-4 font-bold">{row.total}</td>
                    <td className="py-3 px-4" style={{ borderRadius: '0 12px 12px 0' }}>
                      {row.use}{row.pop && <span className="ml-2 text-[11px] font-bold opacity-80">MOST POPULAR</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ Section 6: WHY THIS PRICING WORKS ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            The right intelligence at the right stage.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">When you&apos;re figuring out whether to sell, you don&apos;t need a $25,000 advisory engagement. You need a valuation range and a clear picture of where you stand.</p>
            <p className="m-0">When you&apos;re evaluating a listing, you don&apos;t need a $15,000 Quality of Earnings report. You need a fast, data-backed answer: pursue or pass.</p>
            <p className="m-0">When you&apos;re ready to go to market, you need institutional-grade documents &mdash; CIMs, financial models, market analysis &mdash; at a price that makes sense for where you are in the process.</p>
            <p className="m-0">That&apos;s what the wallet model does. You pay for what you need, when you need it. Early-stage analysis is affordable enough to remove the guesswork. Deal-stage documents are priced to reflect the work &mdash; and the stakes.</p>
            <p className="m-0">And when your deal is ready for a broker, an attorney, or a CPA &mdash; you walk in prepared. With real numbers. With defensible analysis. With documents they can build on.</p>
            <p className="m-0 text-[#1A1A18] font-bold">The professionals you hire will thank you for it.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 7: ADVISORS ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-8 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E] mb-4 block">FOR ADVISORS AND BROKERS</span>
          <div className="text-[18px] font-medium text-[#6E6A63] space-y-4" style={{ lineHeight: 1.6 }}>
            <p className="m-0">Run your first three client journeys free. No subscription. Yulia generates the CIM, runs the valuation, builds the models. You stay in the relationship.</p>
            <p className="m-0">After three journeys, the wallet works like everyone else&apos;s. No per-seat licensing.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 8: WHAT WE DON'T CHARGE FOR ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[
              'Close fees \u2014 they create friction at the worst moment',
              'Tokens or API calls \u2014 our prices are based on value, not compute',
              'Subscriptions (at launch) \u2014 earn the right first',
              'More than 10 visible choices \u2014 the rest unlock through Yulia',
            ].map(item => (
              <div key={item} className="flex items-center gap-4">
                <span className="text-[20px] text-[#E5E5E5] font-black shrink-0">&#10007;</span>
                <span className="text-[16px] md:text-[18px] font-medium text-[#6E6A63]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-24 mt-32">
        <span className="text-[18px] font-extrabold">smb<span className="text-[#D4714E]">X</span>.ai</span>
        <p className="text-[12px] font-medium text-[#9CA3AF] mt-1 m-0" style={{ letterSpacing: '0.1em' }}>
          Deal Intelligence Infrastructure
        </p>
      </footer>
    </div>
  );
}
