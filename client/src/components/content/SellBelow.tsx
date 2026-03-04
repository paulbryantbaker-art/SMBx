interface SellBelowProps {
  onChipClick: (text: string) => void;
}

export default function SellBelow({ onChipClick }: SellBelowProps) {
  void onChipClick; // available for future CTAs
  return (
    <div>
      {/* ═══ Section 1: THE ADD-BACK PROBLEM ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">THE ADD-BACK PROBLEM</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-8" style={{ letterSpacing: '-0.04em' }}>
            Most owners undervalue their own business.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">Not because they&apos;re bad at business. Because tax returns are designed to minimize taxes &mdash; not maximize sale price.</p>
            <p className="m-0">Every dollar of personal expense that runs through your P&amp;L reduces your stated earnings. Your personal vehicle. Your family&apos;s cell phone plan. That one-time legal fee. The above-market rent you pay to your own LLC. Your spouse&apos;s salary for work they don&apos;t actually do.</p>
            <p className="m-0">These are all legitimate add-backs &mdash; expenses a new owner wouldn&apos;t incur &mdash; and they directly increase your adjusted earnings. A $50K add-back on a business trading at 4&times; multiples adds $200K to your sale price.</p>
            <p className="m-0">Most owners miss $100K&ndash;$500K in add-backs they never knew to claim. Yulia identifies them in minutes &mdash; line by line, with explanations a buyer&apos;s CPA will accept.</p>
          </div>

          {/* Example callout card */}
          <div className="bg-[#F9FAFB] mt-10 p-6 md:p-8 max-w-2xl" style={{ borderRadius: '24px', border: '1px solid #F3F4F6' }}>
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">EXAMPLE</span>
            <p className="text-[15px] font-medium text-[#6E6A63] mt-2 mb-4 m-0" style={{ lineHeight: 1.55 }}>
              A cleaning company owner reported $320K in SDE on their tax return. After Yulia&apos;s add-back analysis:
            </p>
            <div className="space-y-1.5 text-[14px] font-medium text-[#1A1A18]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <div className="flex justify-between"><span>+ Owner&apos;s personal vehicle (2 vehicles)</span><span className="text-[#D4714E] shrink-0 ml-4">$48,000</span></div>
              <div className="flex justify-between"><span>+ Family cell phone plan (5 lines)</span><span className="text-[#D4714E] shrink-0 ml-4">$18,000</span></div>
              <div className="flex justify-between"><span>+ One-time legal settlement</span><span className="text-[#D4714E] shrink-0 ml-4">$12,000</span></div>
              <div className="flex justify-between"><span>+ Above-market rent to owner&apos;s LLC</span><span className="text-[#D4714E] shrink-0 ml-4">$31,000</span></div>
              <div className="flex justify-between"><span>+ Personal travel coded as business</span><span className="text-[#D4714E] shrink-0 ml-4">$15,000</span></div>
              <div className="border-t border-[#E5E5E5] mt-3 pt-3 flex justify-between font-bold">
                <span>Adjusted SDE</span><span className="text-[#1A1A18]">$444,000</span>
              </div>
            </div>
            <div className="mt-4 p-3" style={{ background: 'rgba(74,222,128,0.06)', borderLeft: '3px solid #22C55E', borderRadius: '0 10px 10px 0' }}>
              <p className="text-[14px] font-medium text-[#1A1A18] m-0">
                At 3.2&times; multiple: value increased from $1.02M &rarr; $1.42M. That&apos;s $400,000 the owner almost left on the table.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: THE JOURNEY ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">THE PROCESS</span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              Selling is a process. Yulia manages it.
            </h2>
            <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mt-4 max-w-3xl md:mx-auto" style={{ lineHeight: 1.65 }}>
              Most sellers don&apos;t know what they don&apos;t know. That&apos;s the scariest part. Here&apos;s every step &mdash; and how Yulia helps at each one.
            </p>
          </div>

          {/* Mobile: list */}
          <div className="md:hidden space-y-0">
            {[
              { step: '01', title: 'Understand your financials', what: 'Yulia normalizes your P&L, identifies add-backs, calculates true adjusted SDE or EBITDA, and benchmarks your margins against the industry.', why: 'This is the foundation everything else is built on.', deliverable: 'Financial Normalization Report' },
              { step: '02', title: 'Know your number', what: 'Multi-methodology valuation using comparable transactions, industry multiples, and local market data.', why: 'You need a number you can quote to buyers, lenders, and your own attorney with confidence.', deliverable: 'Full Valuation Analysis' },
              { step: '03', title: 'Optimize before you list', what: 'Yulia identifies specific actions that could increase your valuation \u2014 EBITDA margin improvements, revenue diversification, documentation cleanup.', why: '6\u201312 months of optimization can move your sale price by 15\u201330%.', deliverable: 'Pre-Sale Optimization Plan' },
              { step: '04', title: 'Prepare your deal documents', what: 'Confidential Information Memo, teaser profile, financial exhibits, management presentation.', why: 'First impressions matter. A professional CIM signals a serious seller.', deliverable: 'Full CIM Package' },
              { step: '05', title: 'Find and qualify buyers', what: 'Yulia matches your business against active buyer profiles \u2014 SBA buyers, PE firms, search funds, strategic acquirers.', why: 'The wrong buyer wastes months. The right buyer closes.', deliverable: 'Buyer Matching Report' },
              { step: '06', title: 'Navigate offers and close', what: 'LOI evaluation, deal structure analysis, working capital modeling, earnout terms, sources & uses.', why: 'The difference between a good deal and a bad one is in the structure, not just the headline number.', deliverable: 'Deal Structure Analysis' },
            ].map((s, i) => (
              <div key={s.step} className={`py-5 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[28px] font-extrabold text-[#D4714E] opacity-70 leading-none">{s.step}</span>
                  <h3 className="text-[18px] font-bold text-[#1A1A18] m-0">{s.title}</h3>
                </div>
                <p className="text-[14px] text-[#6E6A63] m-0 mb-2" style={{ lineHeight: 1.55 }}>{s.what}</p>
                <p className="text-[13px] text-[#1A1A18] font-semibold m-0 mb-1">{s.why}</p>
                <span className="text-[12px] font-bold text-[#D4714E]">{s.deliverable}</span>
              </div>
            ))}
          </div>

          {/* Desktop: 3+3 grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Understand your financials', body: 'Yulia normalizes your P&L, identifies add-backs, calculates true adjusted SDE or EBITDA, and benchmarks your margins.', deliverable: 'Financial Normalization Report' },
                { step: '02', title: 'Know your number', body: 'Multi-methodology valuation using comparable transactions, industry multiples, and local market data.', deliverable: 'Full Valuation Analysis' },
                { step: '03', title: 'Optimize before you list', body: 'Specific actions to increase your valuation \u2014 margin improvements, revenue diversification, documentation cleanup.', deliverable: 'Pre-Sale Optimization Plan' },
              ].map(s => (
                <div key={s.step} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                  <span className="text-[40px] font-black text-[#D4714E] leading-none mb-3 block">{s.step}</span>
                  <h3 className="text-[20px] font-extrabold mb-3">{s.title}</h3>
                  <p className="text-[15px] font-medium text-[#6E6A63] mb-3" style={{ lineHeight: 1.6 }}>{s.body}</p>
                  <span className="text-[12px] font-bold text-[#D4714E] uppercase tracking-wider">{s.deliverable}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6 mt-6">
              {[
                { step: '04', title: 'Prepare deal documents', body: 'CIM, teaser profile, financial exhibits, management presentation \u2014 everything a qualified buyer needs.', deliverable: 'Full CIM Package' },
                { step: '05', title: 'Find and qualify buyers', body: 'Matched against active buyer profiles \u2014 SBA buyers, PE firms, search funds, strategic acquirers.', deliverable: 'Buyer Matching Report' },
                { step: '06', title: 'Navigate offers and close', body: 'LOI evaluation, deal structure analysis, working capital modeling, earnout terms, sources & uses.', deliverable: 'Deal Structure Analysis' },
              ].map(s => (
                <div key={s.step} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                  <span className="text-[40px] font-black text-[#D4714E] leading-none mb-3 block">{s.step}</span>
                  <h3 className="text-[20px] font-extrabold mb-3">{s.title}</h3>
                  <p className="text-[15px] font-medium text-[#6E6A63] mb-3" style={{ lineHeight: 1.6 }}>{s.body}</p>
                  <span className="text-[12px] font-bold text-[#D4714E] uppercase tracking-wider">{s.deliverable}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: THE BROKER PARTNERSHIP ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-8 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-6" style={{ letterSpacing: '-0.03em' }}>
            Working with a broker? Even better.
          </h3>
          <div className="text-[18px] font-medium text-[#6E6A63] space-y-6" style={{ lineHeight: 1.6 }}>
            <p className="m-0">Great brokers close deals. That&apos;s their superpower &mdash; relationships, negotiations, market timing, emotional management. What eats their time is the prep work.</p>
            <p className="m-0">Bring your smbX.ai analysis to your first advisor meeting. Your broker gets a head start: normalized financials, defensible valuation, market intelligence, and a draft CIM. They focus on what they do best. Yulia handled the data.</p>
            <p className="m-0">And if you don&apos;t have a broker yet? Yulia can help you decide if you need one, what type, and what to look for. Not every deal needs a broker. But the ones that do? Having one is worth every penny.</p>
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
