import PromptChip from './PromptChip';

interface Props {
  onSend?: (prompt: string) => void;
}

export default function PricingContent({ onSend }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-8 animate-[fadeIn_0.5s_ease]">
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        Pricing &amp; Free Tier
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-8">
        If you could Google it,<br />it should be free.
      </h1>

      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        The conversation with Yulia is always free. Foundational analysis &mdash; classification, preliminary valuation,
        market overview &mdash; is free because the underlying data comes from authoritative public sources. What you invest
        in is personalized intelligence, built for your specific deal.
      </p>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-[20px] font-bold text-[#2D3142] mb-1">What&apos;s always free</h3>
          <p className="text-[14px] text-[#4F5D75] mb-6">No credit card. No trial period. No bait-and-switch.</p>
          <ul className="space-y-3 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Unlimited conversation with Yulia</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Business classification &amp; deal sizing</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Preliminary valuation range</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Market overview &amp; add-back identification</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>SBA bankability check</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[rgba(212,113,78,0.2)] p-6" style={{ background: '#FFF8F4' }}>
          <h3 className="text-[20px] font-bold text-[#2D3142] mb-1">How premium works</h3>
          <p className="text-[14px] text-[#4F5D75] mb-6">No subscriptions, no retainers. You approve each purchase individually.</p>
          <ul className="space-y-3 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Full valuation reports</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Market Intelligence Reports</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>CIM generation</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Deal structuring &amp; modeling</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>White-label deliverables</li>
          </ul>
        </div>
      </div>

      {/* ── Below-fold educational content ── */}

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">The free tier in detail</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          Every deal starts with a conversation &mdash; and the foundational analysis is genuinely free.
        </p>

        <div className="space-y-5 mb-6">
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Unlimited conversation</strong> &mdash; Ask Yulia anything about your deal, your market, the M&amp;A process, financing structures, deal strategy. No message limits. No session timeouts.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Business classification</strong> &mdash; Yulia identifies which earnings metric applies (SDE vs. EBITDA), which buyer pool is relevant, and which valuation methodology fits. This classification drives every subsequent analysis.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Preliminary valuation range</strong> &mdash; An initial estimate based on industry multiples, your financial profile, and current market conditions. Not a guess &mdash; a methodology-driven range with the logic explained.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Market overview</strong> &mdash; Industry dynamics for your sector: fragmentation vs. consolidation, PE activity, regional competitive context.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Add-back identification</strong> &mdash; Yulia scans your financial profile for common add-backs: owner compensation adjustments, personal expenses, one-time costs. Many owners miss tens or hundreds of thousands in legitimate add-backs.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">SBA bankability check</strong> &mdash; Whether your deal qualifies for SBA financing at current rates, the DSCR outlook, and what it means for your buyer pool (sellers) or financing options (buyers).
          </p>
        </div>

        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          <strong className="text-[#2D3142]">Why this is genuinely free:</strong> The data sources are publicly available &mdash; Census, BLS, FRED, SEC EDGAR, SBA. The intelligence layer takes seconds to generate. We&apos;d rather you experience the analysis firsthand than trust a marketing page.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Start my free analysis &mdash; I'll tell you about my deal" prompt="Start my free analysis. I'll tell you about my deal and I want to see the quality of your intelligence." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Premium deliverables</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-8">
          When you&apos;re ready to go deeper, Yulia tells you exactly what a deliverable costs before you commit. You approve each purchase individually.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-4">For sellers</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h4 className="text-[14px] font-semibold text-[#2D3142] mb-1">Market Intelligence Report</h4>
                <p className="text-[13px] leading-relaxed text-[#4F5D75]">
                  Comprehensive analysis of your industry&apos;s deal environment, localized to your metro. Competitive density, current multiples, PE activity, buyer landscape, and positioning recommendations.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h4 className="text-[14px] font-semibold text-[#2D3142] mb-1">Full Valuation Analysis</h4>
                <p className="text-[13px] leading-relaxed text-[#4F5D75]">
                  Multi-methodology valuation built for scrutiny. SDE/EBITDA calculation with complete add-back schedule, multiple approaches, sensitivity analysis, and recommendations for maximizing value.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h4 className="text-[14px] font-semibold text-[#2D3142] mb-1">Confidential Information Memorandum (CIM)</h4>
                <p className="text-[13px] leading-relaxed text-[#4F5D75]">
                  Professional deal book for buyer distribution. Financial summary, business overview, growth narrative, market position, investment thesis. White-label available.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h4 className="text-[14px] font-semibold text-[#2D3142] mb-1">Deal Structuring &amp; Negotiation</h4>
                <p className="text-[13px] leading-relaxed text-[#4F5D75]">
                  Offer comparison, asset vs. stock analysis, seller financing optimization, earnout modeling, SBA impact analysis.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-4">For buyers</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h4 className="text-[14px] font-semibold text-[#2D3142] mb-1">Market &amp; Competitive Intelligence</h4>
                <p className="text-[13px] leading-relaxed text-[#4F5D75]">
                  Industry mapping, competitive density, consolidation trends, multiples, target identification framework.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h4 className="text-[14px] font-semibold text-[#2D3142] mb-1">Target Financial Analysis</h4>
                <p className="text-[13px] leading-relaxed text-[#4F5D75]">
                  Full model: DSCR, ROI, sources and uses, SBA bankability, sensitivity analysis, deal structure recommendations.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h4 className="text-[14px] font-semibold text-[#2D3142] mb-1">Due Diligence Intelligence</h4>
                <p className="text-[13px] leading-relaxed text-[#4F5D75]">
                  Pre-diligence risk assessment, red flags, concentration analysis, data room guidance.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <h4 className="text-[14px] font-semibold text-[#2D3142] mb-1">Deal Structuring</h4>
                <p className="text-[13px] leading-relaxed text-[#4F5D75]">
                  Sources and uses optimization, financing mix, seller note and earnout modeling, offer construction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">How the wallet works</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          SMBX uses a wallet system. Add funds when you&apos;re ready &mdash; Yulia tells you the cost before you commit, you approve each purchase individually.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          No subscriptions. No contracts. No recurring charges. Your balance carries forward indefinitely across all your deals. Pause for six months &mdash; your funds are waiting.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          <strong className="text-[#2D3142]">In practice:</strong> Yulia delivers free analysis as you work. When a premium deliverable would add value, she explains what it is, what it costs, and what you&apos;ll get. You choose whether to proceed. The deliverable generates in minutes.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="How much would a full valuation cost for my business?" prompt="How much would a full valuation cost for my business? I want to understand the pricing before I commit." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">For advisors and teams</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          Running multiple engagements? We&apos;re building advisor-specific pricing: volume considerations, white-label options, multi-user access.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Tell me about advisor pricing options" prompt="Tell me about advisor pricing options. I run multiple engagements and want to understand volume pricing." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-4">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-8">Common questions</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-[15px] font-bold text-[#2D3142] mb-2">&ldquo;Is the free analysis really free?&rdquo;</h3>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              No catch. No credit card. No trial that auto-converts. The data sources are publicly available and the synthesis takes seconds to generate. Once you experience it, you&apos;ll recognize the value of going deeper.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-[#2D3142] mb-2">&ldquo;How is this different from ChatGPT?&rdquo;</h3>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              ChatGPT generates plausible text about M&amp;A. SMBX follows a structured seven-layer methodology, synthesizes data from sovereign government sources, and delivers traceable analysis calibrated to your deal. The difference: reading a Wikipedia article about surgery vs. consulting a specialist with your chart open.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-[#2D3142] mb-2">&ldquo;What if I&apos;m already working with a broker?&rdquo;</h3>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              Great &mdash; they should be using SMBX too. Share your analysis with your advisor or invite them to the platform. Many of our most active users are brokers and M&amp;A advisors.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-[#2D3142] mb-2">&ldquo;Can I use deliverables with my clients?&rdquo;</h3>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              Yes. All deliverables can be white-labeled with your firm&apos;s branding.
            </p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-[#2D3142] mb-2">&ldquo;How do you handle confidential information?&rdquo;</h3>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              All data is encrypted and strictly isolated. Buyer and seller data are never mixed. Your information is never shared or used to train models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
