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
            Everything you need to understand your deal. Free.
          </h2>
          <div className="space-y-4 mt-10">
            {[
              'Unlimited conversation with Yulia',
              'Deal classification (SDE vs EBITDA, SBA vs conventional)',
              'Preliminary valuation range',
              'Market overview (your industry, your geography)',
              'Add-back identification guidance',
              'SBA eligibility screening',
              'Exit option analysis (full sale, partner buyout, ESOP, capital raise)',
              'Process guidance and next steps',
              'Broker recommendations',
            ].map(item => (
              <div key={item} className="flex items-center gap-4">
                <span className="text-[20px] text-[#D4714E] font-black shrink-0">&#10003;</span>
                <span className="text-[18px] font-medium text-[#1A1A18]">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#F9FAFB] mt-8 p-6" style={{ borderRadius: '16px', border: '1px solid #F3F4F6' }}>
            <p className="text-[15px] font-bold text-[#1A1A18] m-0" style={{ lineHeight: 1.55 }}>
              No account. No credit card. No catch.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: PREMIUM ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10" style={{ letterSpacing: '-0.04em' }}>
            When your deal needs documents.
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Market Intelligence Report', price: '$200' },
              { title: 'Full Valuation Analysis', price: '$350' },
              { title: 'SBA Bankability Model', price: '$150' },
              { title: 'Deal Structure Analysis', price: '$300' },
              { title: 'Buyer/Seller Matching Report', price: '$250' },
              { title: 'Confidential Information Memo (CIM)', price: '$700' },
              { title: 'Post-Acquisition Value Creation Plan', price: '$400' },
            ].map(item => (
              <div key={item.title} className="flex items-center justify-between bg-[#F9FAFB] px-6 md:px-8 py-4" style={{ borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                <span className="text-[16px] md:text-[18px] font-bold text-[#1A1A18]">{item.title}</span>
                <span className="text-[20px] md:text-[24px] font-black text-[#D4714E] shrink-0 ml-4">{item.price}</span>
              </div>
            ))}
          </div>
          {/* Bundle */}
          <div className="bg-[#1A1A18] text-white px-6 md:px-8 py-6 mt-4" style={{ borderRadius: '16px' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[18px] font-bold">Full Deal Package</span>
              <span className="text-[24px] font-black text-[#D4714E] shrink-0 ml-4">$1,500</span>
            </div>
            <p className="text-[14px] text-[#9CA3AF] m-0">Save $450 vs. individual.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: WALLET ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-8 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-6" style={{ letterSpacing: '-0.03em' }}>
            $1 in = $1 of purchasing power.
          </h3>
          <div className="text-[18px] font-medium text-[#6E6A63] space-y-6" style={{ lineHeight: 1.6 }}>
            <p className="m-0">Add funds when you need a deliverable. Yulia tells you the cost before you commit. No auto-charges. No recurring fees. Balance carries forward across deals.</p>
            <p className="m-0">Advisors: volume pricing through partnership tiers.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: CONTEXT ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            What deal intelligence typically costs.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <div className="space-y-2">
              <p className="m-0">Quality of Earnings report: <span className="text-[#1A1A18] font-bold">$15K&ndash;$50K</span></p>
              <p className="m-0">Certified business valuation: <span className="text-[#1A1A18] font-bold">$5K&ndash;$25K</span></p>
              <p className="m-0">Market research report: <span className="text-[#1A1A18] font-bold">$3K&ndash;$10K</span></p>
            </div>
            <p className="m-0">These professionals earn their fees. smbX.ai gives you institutional-grade intelligence BEFORE and ALONGSIDE the professionals &mdash; so when you hire them, you walk in informed, prepared, and confident.</p>
            <p className="m-0 text-[#1A1A18] font-bold text-[22px]">Full deal intelligence on smbX.ai: under $2,000.</p>
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
