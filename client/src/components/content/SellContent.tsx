import PromptChip from './PromptChip';

interface Props {
  onSend?: (prompt: string) => void;
}

export default function SellContent({ onSend }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-8 animate-[fadeIn_0.5s_ease]">
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        Sell Your Business
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-8">
        Know your number<br />before you negotiate.
      </h1>

      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        Most owners leave money on the table because they don&apos;t know what their business is actually worth.
        Yulia analyzes your financials, market position, and buyer landscape to give you a defensible valuation
        before you talk to anyone.
      </p>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">Add-backs: the value hiding in your financials</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            Owner compensation, personal expenses, one-time costs &mdash; add-backs can increase your valuation by 20&ndash;40%.
            Yulia identifies what qualifies and what doesn&apos;t.
          </p>
          <ul className="space-y-2 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Owner salary above market rate</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Personal vehicle, insurance, travel</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>One-time legal or consulting fees</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Family members on payroll</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">Your buyer&apos;s financing is your problem too</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            80% of small business acquisitions involve SBA lending. If your deal doesn&apos;t pass DSCR, your buyer
            can&apos;t close. Yulia models the financing before you go to market.
          </p>
          <ul className="space-y-2 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>SBA eligibility pre-screening</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>DSCR analysis at multiple price points</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Seller note structuring options</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Equity injection requirements</li>
          </ul>
        </div>
      </div>

      {/* ── Below-fold educational content ── */}

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">How business valuation works</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          Every business sale starts with the same question: what&apos;s it worth? The answer depends on your size, your industry, and your market.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">Which metric matters depends on your business.</strong> Businesses with owner earnings below roughly $2M are typically valued on SDE (Seller&apos;s Discretionary Earnings) &mdash; your net income plus your salary, depreciation, interest, and legitimate add-backs. This represents the total cash flow available to an owner-operator.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          Larger businesses &mdash; generally those with $2M+ in EBITDA &mdash; are valued on adjusted EBITDA, which strips out the owner&apos;s personal compensation and focuses on earnings available to any buyer, including institutional ones.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">Why this matters:</strong> A business with $800K in SDE might be worth 2.5x&ndash;3.5x ($2M&ndash;$2.8M). That same business recast on EBITDA in an industry with active PE consolidation might trade at 4.5x&ndash;5.5x. Knowing which metric applies &mdash; and which buyers are looking &mdash; can swing your valuation by hundreds of thousands of dollars.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">Multiples aren&apos;t magic numbers.</strong> They vary based on industry, geography, growth, owner dependency, customer concentration, and market conditions. A 3x multiple for a consulting firm might be generous. A 3x for a recurring-revenue HVAC company with PE interest might be leaving money behind.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          <strong className="text-[#2D3142]">Ask Yulia:</strong> She calculates your specific valuation using current industry multiples, localized market data, and your financial profile &mdash; then explains exactly what&apos;s driving the range.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="What earnings metric applies to my business?" prompt="What earnings metric applies to my business? Help me understand whether I should use SDE or EBITDA." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Understanding add-backs</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          Add-backs are expenses that run through your business but wouldn&apos;t exist under new ownership. They increase your adjusted earnings, which directly increases your valuation. Most owners miss legitimate add-backs worth tens or hundreds of thousands of dollars.
        </p>

        <div className="space-y-5 mb-6">
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Owner compensation adjustments</strong> &mdash; If you pay yourself $250K but market salary for your role is $120K, the $130K difference is an add-back. If your spouse is on payroll for a role that wouldn&apos;t exist post-sale, that salary is an add-back too.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Personal expenses through the business</strong> &mdash; Vehicle leases, personal insurance, travel that&apos;s partially personal, club memberships, family cell phone plans. Real expenses that buyers won&apos;t inherit.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">One-time and non-recurring costs</strong> &mdash; A lawsuit settlement, a one-time equipment purchase, a facility move. These reduce your reported earnings but won&apos;t recur for the buyer.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Above-market related-party costs</strong> &mdash; If you rent your building from yourself at above-market rates, the difference between what you pay and market rate is an add-back.
          </p>
        </div>

        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          <strong className="text-[#2D3142]">The impact:</strong> On a business valued at a 3x multiple, every $50K in legitimate add-backs you identify is worth $150K in enterprise value. But not every add-back survives buyer scrutiny &mdash; Yulia flags which ones are defensible and which might get challenged in diligence.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Help me identify add-backs in my financials" prompt="Help me identify add-backs in my financials. I want to make sure I'm not leaving money on the table." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Why SBA financing matters to sellers</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          Most sellers don&apos;t think about their buyer&apos;s financing &mdash; but they should. The majority of business acquisitions under $5M are financed through SBA loans, which means SBA requirements directly affect who can buy your business and what they can pay.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">How it works:</strong> The buyer puts up a minimum 10% equity injection. The SBA guarantees a loan (up to $5M for 7(a) loans) through an approved lender. The lender evaluates whether the business&apos;s earnings can service the debt &mdash; requiring a Debt Service Coverage Ratio (DSCR) of at least 1.25x.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">What this means for you:</strong> If your adjusted earnings can&apos;t support the debt at your asking price, SBA lenders won&apos;t approve the loan. That either eliminates most of your buyer pool or forces a price reduction. Knowing your SBA bankability score before you go to market tells you whether your asking price is financeable.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          <strong className="text-[#2D3142]">Current SBA rates are running 6.75%&ndash;9.25%.</strong> At these rates, a business with $400K in SDE can support roughly $1.6M&ndash;$1.8M in total debt. If your asking price is $2.2M, you need a plan for that gap &mdash; seller financing, higher buyer equity, or price adjustment.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Run an SBA bankability check on my business" prompt="Run an SBA bankability check on my business. I want to know if my asking price is financeable." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-8">The selling journey: what to expect</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-8">
          Selling a business follows a structured process. Here&apos;s each stage, what happens, and how Yulia helps.
        </p>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 1</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Tell Yulia about your business <span className="text-[#9CA3AF] font-normal text-[13px]">(free)</span></h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-2">
              Describe your business &mdash; industry, location, size, financials. Yulia classifies your deal and identifies the right analytical framework.
            </p>
            <p className="text-[13px] text-[#6B7280] italic mb-3">What you&apos;ll get: Deal classification, initial market context, the right earnings metric for your situation.</p>
            <PromptChip label='Try it: "I own a plumbing company in Phoenix doing $1.2M revenue"' prompt="I own a plumbing company in Phoenix doing $1.2M revenue. Help me understand what it might be worth." onSend={onSend} />
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 2</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Financial analysis <span className="text-[#9CA3AF] font-normal text-[13px]">(free)</span></h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-2">
              Yulia analyzes your financials &mdash; either from your description or from uploaded statements. She calculates SDE or EBITDA, identifies add-backs, normalizes your earnings, and delivers a preliminary valuation range.
            </p>
            <p className="text-[13px] text-[#6B7280] italic mb-3">What you&apos;ll get: Earnings calculation, add-back identification, preliminary valuation range, comparison to industry benchmarks.</p>
            <PromptChip label='Try it: "Here are my numbers &mdash; help me calculate my SDE"' prompt="Here are my numbers — help me calculate my SDE. I want to understand my true earnings." onSend={onSend} />
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 3</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Full valuation &amp; market intelligence</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-2">
              This is where the analysis goes deep. Yulia generates a comprehensive valuation grounded in your specific market &mdash; industry multiples for your sector and region, competitive landscape analysis, buyer demand signals, and specific recommendations for maximizing your sale price.
            </p>
            <p className="text-[13px] text-[#6B7280] italic mb-3">What you&apos;ll get: Multi-methodology valuation report, localized market intelligence, competitive landscape, buyer landscape mapping, EBITDA optimization recommendations.</p>
            <PromptChip label={`Try it: "I'm ready for a full valuation report"`} prompt="I'm ready for a full valuation report. Give me the comprehensive analysis." onSend={onSend} />
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 4</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Deal packaging</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-2">
              A well-packaged deal sells faster and for more money. Yulia produces the materials that present your business to buyers &mdash; a professional CIM built from your financial data and market intelligence, in the format serious buyers and lenders expect.
            </p>
            <p className="text-[13px] text-[#6B7280] italic mb-3">What you&apos;ll get: Confidential Information Memorandum (CIM), financial summary, deal highlights, data room guidance, deal structure recommendations.</p>
            <PromptChip label='Try it: "Help me build a CIM for my business"' prompt="Help me build a CIM for my business. I want to present it professionally to buyers." onSend={onSend} />
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 5</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Matching &amp; negotiation</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-2">
              Once your deal is packaged, Yulia helps evaluate offers, model deal structures (asset vs. stock, seller financing, earnouts, SBA options), and understand the financial implications of each path.
            </p>
            <p className="text-[13px] text-[#6B7280] italic mb-3">What you&apos;ll get: Buyer qualification analysis, offer comparison modeling, deal structure optimization, negotiation intelligence.</p>
            <PromptChip label='Try it: "I received an offer &mdash; help me evaluate it"' prompt="I received an offer — help me evaluate it. I want to understand if it's fair." onSend={onSend} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-4">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Working with a broker or advisor</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          SMBX intelligence makes every advisory engagement more productive. If you&apos;re already working with a broker:
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">Share your analysis</strong> &mdash; Give your advisor your SMBX valuation and market intelligence to accelerate the engagement. The market research Yulia provides is the same groundwork your broker would do in the first weeks &mdash; having it ready from day one lets them focus on relationships and negotiations.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">Invite your advisor</strong> &mdash; Brokers can access SMBX directly to package deals, qualify buyers, and generate white-label deliverables under their own brand.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          <strong className="text-[#2D3142]">You don&apos;t have to choose.</strong> Whether you work with a professional or explore independently, the intelligence adapts to your situation.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="I'm working with a broker &mdash; how does SMBX fit in?" prompt="I'm working with a broker. How does SMBX fit into our process?" onSend={onSend} />
        </div>
      </div>
    </div>
  );
}
