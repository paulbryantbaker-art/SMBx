interface PricingBelowProps {
  onChipClick: (text: string) => void;
}

export default function PricingBelow({ onChipClick }: PricingBelowProps) {
  return (
    <div>
      {/* ═══ Block 1 — Canvas: Free forever ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>FREE FOREVER</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
            These are free. Not &ldquo;free trial&rdquo; free. Free forever.
          </h2>
          <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            Before Yulia ever mentions a price, she&apos;s already delivered the foundational analysis for your deal.
          </p>

          <div className="space-y-4">
            {[
              { icon: '\uD83D\uDCCA', title: 'Bizestimate', desc: 'Your business valuation range \u2014 updated quarterly as market conditions change. Shareable link you can send to anyone who needs to see the number.', badge: 'Free' },
              { icon: '\uD83D\uDCCB', title: 'Value Readiness Report', desc: '7-factor score with specific improvement actions and dollar-impact estimates. The kind of analysis that feels like $2\u20135K of consultant work.', badge: 'Free' },
              { icon: '\uD83C\uDFAF', title: 'Investment Thesis Document', desc: 'Acquisition blueprint with criteria, SBA eligibility, capital stack template, and market landscape overview.', badge: 'Free' },
              { icon: '\uD83D\uDCC8', title: 'Preliminary SDE / EBITDA', desc: 'The add-back math and adjusted earnings calculation \u2014 the foundation everything else is built on.', badge: 'Free' },
              { icon: '\u2696\uFE0F', title: 'Deal Structure Comparison', desc: 'Asset sale vs. stock sale net-proceeds modeling. Entity-type flag. Preliminary tax landscape. The analysis that usually requires a $500/hour CPA conversation.', badge: 'Free' },
            ].map(item => (
              <div key={item.title} className="flex items-start justify-between" style={{ background: '#F7F6F4', borderRadius: 16, border: '1px solid rgba(26,26,24,0.05)', padding: '20px 28px' }}>
                <div className="flex-1 min-w-0 mr-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 4px' }}>
                    <span style={{ marginRight: 6 }}>{item.icon}</span>{item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.08)', padding: '4px 12px', borderRadius: 100 }} className="shrink-0">{item.badge}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#F7F6F4', borderRadius: 16, border: '1px solid rgba(26,26,24,0.05)', padding: '20px 28px', marginTop: 16 }}>
            <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.55 }}>
              Plus: unlimited conversation with Yulia, deal classification, SBA screening, process guidance, exit option analysis, tax structure modeling, legal preparation, and broker recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Block 2 — Canvas: Tier 1 ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>TIER 1 &middot; KNOW YOUR POSITION</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
            Go deeper when you&apos;re ready.
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Business Valuation Report', price: '$350', desc: 'Multi-methodology analysis with comps, multiples, and local market data. Defensible at the closing table.' },
              { title: 'Market Intelligence Report', price: '$200', desc: 'Competitive landscape, regional economics, PE activity, industry benchmarks \u2014 localized to your MSA.' },
              { title: 'Deal Screening Memo', price: '$150', desc: 'Pursue or pass? Financial validation, risk flags, tax structure check, and a clear recommendation.' },
              { title: 'Target Valuation', price: '$350', desc: 'What should you actually pay? Comparable transactions, industry multiples, and the fair value range.' },
              { title: 'SBA Financing Model', price: '$200', desc: 'Down payment, monthly payment, DSCR, cash-on-cash \u2014 modeled at live rates. Know if it\u2019s bankable.' },
              { title: 'Reality Check', price: '$150', desc: 'Quick-turn sanity check on any aspect of your deal \u2014 pricing, timing, structure, tax implications, risk.' },
            ].map(item => (
              <div key={item.title} className="flex items-start justify-between" style={{ background: '#F7F6F4', borderRadius: 16, border: '1px solid rgba(26,26,24,0.05)', padding: '20px 28px' }}>
                <div className="flex-1 min-w-0 mr-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#D4714E' }} className="shrink-0">{item.price}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(26,26,24,0.4)', marginTop: 16, fontStyle: 'italic' }}>Prices shown are L1/L2. Larger deals scale proportionally.</p>
        </div>
      </section>

      {/* ═══ Block 3 — Canvas: Tier 2 ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>TIER 2 &middot; DOCUMENTS THAT CLOSE DEALS</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
            Prepare to transact.
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Confidential Information Memo', price: '$700', desc: '25+ page presentation of your business to qualified buyers. Professional. Data-backed. The document that starts your deal process.' },
              { title: 'Living CIM (auto-updates)', price: '$900', desc: 'Your CIM stays current when financials change. Version-controlled. Always ready to distribute.' },
              { title: 'Full Valuation Suite', price: '$500', desc: 'Valuation + Market Intel + SBA Feasibility \u2014 bundled together. Save ~$250 vs. individual purchases.', badge: 'Bundle' },
              { title: 'QoE Lite', price: '$500', desc: 'Pre-QoE gap analysis. See what a Quality of Earnings firm will find \u2014 before you pay $15K\u2013$150K for one.' },
              { title: 'Tax Structure Analysis', price: '$350', desc: 'Full asset-vs-stock comparison with entity-type modeling, purchase price allocation scenarios, installment sale modeling, and QSBS screening.', badge: 'New' },
              { title: 'Term Sheet Generator', price: '$250', desc: 'Comprehensive term sheet covering every APA section \u2014 reps, indemnification, escrow, non-compete, working capital \u2014 ready for your attorney.', badge: 'New' },
            ].map(item => (
              <div key={item.title} className="flex items-start justify-between" style={{ background: '#F7F6F4', borderRadius: 16, border: '1px solid rgba(26,26,24,0.05)', padding: '20px 28px' }}>
                <div className="flex-1 min-w-0 mr-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 4px' }}>
                    {item.title}
                    {item.badge && <span style={{ marginLeft: 8, fontSize: '10px', fontWeight: 700, color: '#D4714E', background: 'rgba(212,113,78,0.08)', padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.badge}</span>}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#D4714E' }} className="shrink-0">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 4 — Memo: Progressive reveal [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PROGRESSIVE REVEAL</span>
          <h3 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.03em', marginTop: 12, marginBottom: 20 }} className="md:text-[36px]">
            More analysis unlocks as your deal progresses.
          </h3>
          <div style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Yulia introduces additional tools &mdash; LOI drafts, negotiation strategy, due diligence checklists, deal structure analysis, tax optimization modeling, legal preparation, closing documents &mdash; at exactly the moment you need them.</p>
            <p className="m-0 mt-4" style={{ color: '#1A1A18', fontWeight: 600 }}>
              You won&apos;t see a menu of 24 items when you&apos;re just starting out. You&apos;ll see the next right thing &mdash; priced for the stage of the deal you&apos;re in.
            </p>
            <p className="m-0 mt-4">
              That&apos;s not a limitation. That&apos;s the product. The right intelligence at the right moment reduces decision fatigue and makes every purchase feel like the obvious next step.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Block 5 — Canvas: Wallet ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>WALLET</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
            Fund your wallet. Spend as you go.
          </h2>
          <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginBottom: 32, lineHeight: 1.6 }}>
            No monthly fees. No seat licenses. No surprise invoices. Every purchase is a specific decision at a specific moment in your deal.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
              <thead>
                <tr style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.45)' }}>
                  <th className="py-2 px-4" style={{ fontWeight: 600 }}>Amount</th>
                  <th className="py-2 px-4" style={{ fontWeight: 600 }}>Bonus</th>
                  <th className="py-2 px-4" style={{ fontWeight: 600 }}>Total</th>
                  <th className="py-2 px-4" style={{ fontWeight: 600 }}>Best For</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px', fontWeight: 500 }}>
                {[
                  { amount: '$50', bonus: '\u2014', total: '$50', use: 'Exploratory' },
                  { amount: '$100', bonus: '+$5', total: '$105', use: 'Early commit' },
                  { amount: '$250', bonus: '+$15', total: '$265', use: 'Active deal', pop: true },
                  { amount: '$500', bonus: '+$40', total: '$540', use: 'Serious seller/buyer' },
                  { amount: '$1,000', bonus: '+$100', total: '$1,100', use: 'Full deal journey' },
                  { amount: '$2,500', bonus: '+$300', total: '$2,800', use: 'Advisor with multiple clients' },
                ].map(row => (
                  <tr key={row.amount} style={{ background: row.pop ? '#D4714E' : '#F7F6F4', color: row.pop ? '#fff' : undefined, borderRadius: 12 }}>
                    <td className="py-3 px-4" style={{ fontWeight: 600, borderRadius: '12px 0 0 12px' }}>{row.amount}</td>
                    <td className="py-3 px-4">{row.bonus}</td>
                    <td className="py-3 px-4" style={{ fontWeight: 600 }}>{row.total}</td>
                    <td className="py-3 px-4" style={{ borderRadius: '0 12px 12px 0' }}>
                      {row.use}{row.pop && <span style={{ marginLeft: 8, fontSize: '11px', fontWeight: 600, opacity: 0.8 }}>MOST POPULAR</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ Block 6 — Memo: Philosophy [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHILOSOPHY</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            The right intelligence at the right stage.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">When you&apos;re figuring out whether to sell, you need a valuation range and a clear picture of where you stand. Not a six-figure advisory engagement.</p>
            <p className="m-0">When you&apos;re evaluating a listing, you need a fast, data-backed answer: pursue or pass. Not months of analysis.</p>
            <p className="m-0">When you&apos;re ready to go to market, you need institutional-grade documents &mdash; CIMs, financial models, market analysis &mdash; at a price that makes sense for where you are in the process.</p>
            <p className="m-0">When the deal gets real, you need tax structure modeling and legal preparation &mdash; the analysis that informs the decisions your CPA and attorney will help you execute.</p>
            <p className="m-0">That&apos;s what the wallet model does. You pay for what you need, when you need it. Early-stage analysis is affordable enough to remove guesswork. Deal-stage documents are priced to reflect the work &mdash; and the stakes.</p>
            <p className="m-0">And when your deal is ready for a broker, an attorney, or a CPA &mdash; you walk in prepared. With real numbers. With defensible analysis. With tax scenarios modeled. With term sheets drafted. With documents they can build on.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>The professionals you hire will thank you for it.</p>
          </div>
        </div>
      </section>

      {/* ═══ Block 7 — Canvas: Advisor callout ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E', display: 'block', marginBottom: 16 }}>FOR ADVISORS AND BROKERS</span>
          <h3 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 16 }} className="md:text-[36px]">
            Run your first three client journeys free.
          </h3>
          <div className="space-y-4" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.6 }}>
            <p className="m-0">No subscription. Yulia generates the CIM, runs the valuation, models the tax structure, builds the term sheet. You stay in the relationship.</p>
            <p className="m-0">After three journeys, the wallet works like everyone else&apos;s. No per-seat licensing.</p>
          </div>
        </div>
      </section>

      {/* ═══ Block 8 — Canvas: What we don't charge for ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>WHAT WE DON&apos;T CHARGE FOR</span>
          <div className="space-y-4 mt-10">
            {[
              'Close fees \u2014 they create friction at the worst moment',
              'Tokens or API calls \u2014 our prices are based on value, not compute',
              'Subscriptions (at launch) \u2014 earn the right first',
              'More than 10 visible choices \u2014 the rest unlock through Yulia',
              'Tax or legal opinions \u2014 Yulia models the landscape and the math; your CPA and attorney provide the advice',
            ].map(item => (
              <div key={item} className="flex items-center gap-4">
                <span style={{ fontSize: '20px', color: 'rgba(26,26,24,0.15)', fontWeight: 700 }} className="shrink-0">&#10007;</span>
                <span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Block 9 — Next Step */}
          <div className="mt-10">
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Start a free analysis &rarr; see the workflow in action</p>
            <button
              onClick={() => onChipClick("Start a free analysis")}
              style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              type="button"
            >
              Start chatting &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
