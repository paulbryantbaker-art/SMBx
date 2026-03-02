import PromptChip from './PromptChip';

interface Props {
  onSend?: (prompt: string) => void;
}

export default function BuyContent({ onSend }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-8 animate-[fadeIn_0.5s_ease]">
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        Buy a Business
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-8">
        Find the right deal.<br />Know it&apos;s the right deal.
      </h1>

      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        Acquisitions fail when buyers don&apos;t have the intelligence to evaluate what they&apos;re buying.
        Yulia gives you market intelligence, financial modeling, and deal analysis that turns conviction
        from a feeling into a number.
      </p>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">The numbers behind every deal</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            Asking price is a starting point, not a destination. Yulia models DSCR, return on equity, sources and uses, and cash-on-cash returns &mdash; so you know whether a deal meets your financial objectives before you commit.
          </p>
          <ul className="space-y-2 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Debt service coverage analysis</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Return projections at multiple scenarios</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>SBA financing feasibility</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Sensitivity analysis</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">Market intelligence before you buy</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            Understanding your target market changes how you negotiate. Yulia maps competitive density, consolidation trends, PE activity, and regional dynamics for any industry and geography.
          </p>
          <ul className="space-y-2 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Competitive landscape mapping</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Industry multiple benchmarks</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Consolidation and PE activity</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Regional economic indicators</li>
          </ul>
        </div>
      </div>

      {/* ── Below-fold educational content ── */}

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Understanding the market before you buy</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">Industry dynamics matter more than most buyers realize.</strong> Whether an industry is fragmenting or consolidating changes everything about your acquisition strategy. In a fragmented market (hundreds of small operators, no dominant players), you&apos;re buying a standalone business. In a consolidating market (PE firms actively rolling up competitors), you may be building or joining a platform &mdash; which changes your target profile, your valuation framework, and your exit strategy.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          <strong className="text-[#2D3142]">Competitive density shapes pricing.</strong> The number of similar businesses in your target market directly affects what you&apos;ll pay. In a market with 200 competitors, sellers have less leverage. In a market with 15, they have more. Understanding this before you negotiate puts you in a fundamentally different position.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Map the competitive landscape for my target industry" prompt="Map the competitive landscape for my target industry and geography. I want to understand the market before I buy." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Financial modeling: the numbers that matter</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          The asking price is a starting point. What matters is what the business is actually worth to you &mdash; after financing costs, operating assumptions, and return requirements.
        </p>

        <div className="space-y-5 mb-6">
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Debt Service Coverage Ratio (DSCR)</strong> &mdash; The number lenders care about most. It&apos;s the business&apos;s adjusted earnings divided by annual debt payments. SBA lenders require minimum 1.25x. Conventional lenders typically want 1.50x. If the DSCR doesn&apos;t work at your offer price, the deal doesn&apos;t close.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Return on equity</strong> &mdash; After debt service, what&apos;s your cash return on the equity you invested? A deal at a 3x multiple might deliver a 15% cash-on-cash return &mdash; or 40%, depending on the debt structure. Modeling this before you offer tells you whether this deal meets your objectives.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Sources and uses</strong> &mdash; Where is the money coming from (SBA loan, seller note, buyer equity) and where is it going (purchase price, working capital, closing costs)? Understanding the full capital stack before you negotiate means you know exactly what you&apos;re committing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Model the financing for a $2M acquisition" prompt="Model the financing for a $2M acquisition. Help me understand the full capital structure." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">SBA financing: what buyers need to know</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          For deals under $5M, SBA financing is how most acquisitions get done.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">The basics:</strong> Minimum 10% buyer equity injection. Maximum $5M on the standard 7(a) program. Current rates range from 6.75% to 9.25%. The business must demonstrate a DSCR of at least 1.25x &mdash; meaning its earnings cover debt payments with a 25% cushion.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          <strong className="text-[#2D3142]">What disqualifies a deal:</strong> Businesses in certain excluded industries, deals where the seller retains more than 20% ownership, businesses that can&apos;t demonstrate sufficient earnings to service the debt. Yulia pre-screens every deal for SBA eligibility so you don&apos;t waste months on something that won&apos;t get financed.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          <strong className="text-[#2D3142]">The equity injection question:</strong> The 10% minimum is the floor, not the ceiling. Lenders often want more &mdash; especially for larger deals or businesses with concentration risk. Yulia models the actual equity requirement based on the specific deal and current lending conditions.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Check SBA eligibility for a deal I'm considering" prompt="Check SBA eligibility for a deal I'm considering. I want to know if it can be financed." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-8">The acquisition journey: stage by stage</h2>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 1</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Thesis &amp; sourcing <span className="text-[#9CA3AF] font-normal text-[13px]">(free)</span></h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-3">
              Define what you&apos;re looking for &mdash; industry, geography, size, financial criteria. Yulia maps the market: how many businesses fit your criteria, what they trade for, where consolidation is happening.
            </p>
            <PromptChip label='Try it: "I want to buy an HVAC company in Texas under $3M"' prompt="I want to buy an HVAC company in Texas under $3M. Help me understand the market." onSend={onSend} />
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 2</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Target screening <span className="text-[#9CA3AF] font-normal text-[13px]">(free)</span></h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-3">
              Evaluate specific opportunities. Bring Yulia a listing, a deal your broker sent, or a business you heard about &mdash; get an instant assessment of financials, market position, and whether the asking price is realistic.
            </p>
            <PromptChip label='Try it: "Evaluate this business &mdash; $1.5M revenue, $380K SDE, asking $1.2M"' prompt="Evaluate this business — $1.5M revenue, $380K SDE, asking $1.2M. Is it a good deal?" onSend={onSend} />
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 3</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Financial modeling</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-3">
              Deep modeling on a specific target: DSCR at various price and rate assumptions, return on equity, sources and uses, SBA bankability, and sensitivity analysis. The numbers behind the decision.
            </p>
            <PromptChip label='Try it: "Build a financial model for this acquisition"' prompt="Build a financial model for this acquisition. I need the full numbers — DSCR, ROI, sources and uses." onSend={onSend} />
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 4</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Due diligence intelligence</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-3">
              Before you spend $15K&ndash;$50K on professional diligence, know what you&apos;re walking into. Customer concentration, owner dependency, financial hygiene, red flags. This isn&apos;t a replacement for professional diligence &mdash; it&apos;s the intelligence that helps you decide whether to spend the money.
            </p>
            <PromptChip label='Try it: "What should I look for in diligence on this deal?"' prompt="What should I look for in diligence on this deal? Help me understand the risks before I commit to full DD." onSend={onSend} />
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#D4714E] mb-1">Stage 5</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Structuring &amp; close</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-3">
              Deal structure determines returns. Asset vs. stock, allocation strategy, seller financing terms, earnout scenarios, working capital pegs. Yulia models the options and shows the tradeoffs.
            </p>
            <PromptChip label='Try it: "Help me structure my offer"' prompt="Help me structure my offer. I want to understand asset vs. stock, seller financing options, and the best deal structure." onSend={onSend} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-4">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">For search funds, PE, and institutional buyers</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          Managing a pipeline of targets? Yulia delivers institutional-grade intelligence at deal-flow speed.
        </p>
        <div className="space-y-5 mb-6">
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Search fund operators:</strong> Define your thesis and get instant market intelligence for every industry and geography you&apos;re evaluating. Model acquisitions against your fund structure and SBA eligibility.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">PE deal teams:</strong> Screen bolt-on targets against your platform. Map consolidation activity across geographies. Generate preliminary models for IC review in minutes.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Family offices:</strong> Evaluate direct investments with institutional analytical depth, calibrated to your criteria and return expectations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="I'm a search fund operator &mdash; help me screen industries" prompt="I'm a search fund operator. Help me screen industries and geographies for acquisition targets that fit my thesis." onSend={onSend} />
        </div>
      </div>
    </div>
  );
}
