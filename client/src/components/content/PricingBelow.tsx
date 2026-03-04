interface PricingBelowProps {
  onChipClick: (text: string) => void;
}

export default function PricingBelow({ onChipClick }: PricingBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: FREE TIER ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">ALWAYS FREE</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-4" style={{ letterSpacing: '-0.04em' }}>
            Everything you need to understand your deal.
          </h2>
          <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mb-10" style={{ lineHeight: 1.65 }}>
            No account required. No credit card. No time limit. Just start talking.
          </p>
          <div className="space-y-4">
            {[
              'Unlimited conversation with Yulia',
              'Deal classification (SDE vs EBITDA, SBA vs conventional)',
              'Preliminary valuation range',
              'General market overview for your industry and geography',
              'Add-back identification guidance',
              'SBA eligibility screening',
              'Process guidance and next steps',
              'Broker recommendations (if you need one)',
            ].map(item => (
              <div key={item} className="flex items-center gap-4">
                <span className="text-[20px] text-[#D4714E] font-black shrink-0">&#10003;</span>
                <span className="text-[18px] font-medium text-[#1A1A18]">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#F9FAFB] mt-8 p-6" style={{ borderRadius: '16px', border: '1px solid #F3F4F6' }}>
            <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>
              This isn&apos;t a teaser. The free tier delivers real intelligence &mdash; enough to know your number, understand your market, and decide your next move. Most platforms charge for what you get here for free.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: PREMIUM DELIVERABLES ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PREMIUM</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-4" style={{ letterSpacing: '-0.04em' }}>
            When your deal needs documents.
          </h2>
          <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mb-10" style={{ lineHeight: 1.65 }}>
            Premium deliverables are generated from your conversation &mdash; formatted, sourced, and ready for lenders, buyers, attorneys, and closing tables.
          </p>
          <div className="space-y-4">
            {[
              { title: 'Market Intelligence Report', price: '$200', desc: 'Competitive landscape, regional economics, industry benchmarks, PE activity \u2014 localized to your MSA.' },
              { title: 'Full Valuation Analysis', price: '$350', desc: 'Multi-methodology valuation with comparable transactions, industry multiples, add-back schedule, and market context.' },
              { title: 'SBA Bankability Model', price: '$150', desc: 'DSCR analysis, sources & uses, cash-on-cash returns, and SBA eligibility assessment at live federal rates.' },
              { title: 'Deal Structure Analysis', price: '$300', desc: 'Asset vs stock, financing scenarios, earnout modeling, working capital targets, sources & uses.' },
              { title: 'Buyer Matching Report', price: '$250', desc: 'Your business matched against active buyer profiles \u2014 PE, search fund, SBA, strategic \u2014 with fit scoring.' },
              { title: 'Confidential Information Memo', price: '$700', desc: '25+ page professional document presenting your business to qualified buyers. The document that starts your process.' },
            ].map(item => (
              <div key={item.title} className="bg-[#F9FAFB] px-6 md:px-8 py-5" style={{ borderRadius: '24px', border: '1px solid #F3F4F6' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[18px] font-bold text-[#1A1A18]">{item.title}</span>
                  <span className="text-[24px] font-black text-[#D4714E] shrink-0 ml-4">{item.price}</span>
                </div>
                <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          {/* Bundle */}
          <div className="bg-[#1A1A18] text-white px-6 md:px-8 py-6 mt-4" style={{ borderRadius: '24px' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[18px] font-bold">Full Deal Package (all of the above)</span>
              <span className="text-[24px] font-black text-[#D4714E] shrink-0 ml-4">$1,500</span>
            </div>
            <p className="text-[14px] text-[#9CA3AF] m-0">Everything, bundled. Save $450 vs purchasing individually.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: HOW THE WALLET WORKS ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-8 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-6" style={{ letterSpacing: '-0.03em' }}>
            Your wallet. Your pace.
          </h3>
          <div className="text-[18px] font-medium text-[#6E6A63] space-y-6" style={{ lineHeight: 1.6 }}>
            <p className="m-0">Add funds whenever you&apos;re ready for a premium deliverable. Yulia tells you exactly what a document costs before you commit. No auto-charges. No recurring fees.</p>
            <p className="m-0 text-[#1A1A18] font-bold text-[20px]">$1 in your wallet = $1 of purchasing power.</p>
            <p className="m-0">Your balance carries forward. Use it on one deal or across many. Add funds as you need them.</p>
            <p className="m-0">For advisors handling multiple deals: volume pricing and monthly billing are available through our partnership tiers.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: THE VALUE CONTEXT ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            Perspective.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">A business broker typically charges 8&ndash;12% of the transaction value. On a $2M deal, that&apos;s $160K&ndash;$240K. On a $5M deal, that&apos;s $400K&ndash;$600K.</p>
            <div className="space-y-1">
              <p className="m-0">A Quality of Earnings report from a CPA firm: $15K&ndash;$50K.</p>
              <p className="m-0">A business valuation from a certified appraiser: $5K&ndash;$25K.</p>
              <p className="m-0">A market research report from an industry analyst: $3K&ndash;$10K.</p>
            </div>
            <p className="m-0">smbX.ai doesn&apos;t replace any of these professionals. They earn their fees. What Yulia does is give you institutional-grade intelligence BEFORE you hire them &mdash; so when you do, you walk in informed, prepared, and confident.</p>
            <p className="m-0 text-[#1A1A18] font-bold">Full deal intelligence. Under $2,000.</p>
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
