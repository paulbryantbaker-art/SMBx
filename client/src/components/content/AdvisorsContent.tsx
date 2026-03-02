import PromptChip from './PromptChip';

interface Props {
  onSend?: (prompt: string) => void;
}

export default function AdvisorsContent({ onSend }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-8 animate-[fadeIn_0.5s_ease]">
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        For Advisors
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-8">
        Your expertise closes deals.<br />Now close more of them.
      </h1>

      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        SMBX gives M&amp;A advisors, business brokers, and deal professionals the intelligence infrastructure
        to serve more clients, package better deals, and move through engagements faster.
      </p>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">Package deals in minutes, not weeks</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            Instant market intelligence for any new listing &mdash; industry multiples, competitive landscape, preliminary valuation, add-back identification. The groundwork you&apos;d do manually, ready in a conversation.
          </p>
          <ul className="space-y-2 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Localized industry multiples</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Competitive density analysis</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Preliminary valuation with methodology</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Client-ready Market Intelligence Report</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">White-label everything</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            Every deliverable Yulia generates &mdash; valuations, market reports, CIMs, financial analyses &mdash; can be branded with your firm&apos;s identity. Your clients see your analysis. You get institutional-quality work product.
          </p>
          <ul className="space-y-2 text-[14px] text-[#4F5D75]">
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Branded valuation reports</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>White-label CIMs</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Market intelligence under your name</li>
            <li className="flex items-start gap-2"><span className="text-[#D4714E] mt-0.5">&#10003;</span>Professional formatting and presentation</li>
          </ul>
        </div>
      </div>

      {/* ── Below-fold educational content ── */}

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">How advisors use SMBX</h2>

        <div className="space-y-8">
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-3">
              <strong className="text-[#2D3142]">Package a new listing in minutes.</strong> A new seller engagement used to mean days of research before you could have an informed pricing conversation. Tell Yulia about the business and get instant market intelligence: industry multiples for the specific sector and metro, competitive landscape, preliminary valuation range, and add-back identification. Use it to sharpen your analysis or generate a client-facing report in minutes.
            </p>
            <PromptChip label='Try it: "I just signed a commercial cleaning company in Atlanta, $1.8M revenue"' prompt="I just signed a commercial cleaning company in Atlanta, $1.8M revenue. Help me package it with market intelligence and a preliminary valuation." onSend={onSend} />
          </div>

          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-3">
              <strong className="text-[#2D3142]">Qualify buyers before you waste time.</strong> Yulia pre-screens buyer financials against SBA lending requirements &mdash; DSCR at current rates (6.75%&ndash;9.25%), minimum equity injection (10%), and whether the business&apos;s earnings produce coverage above the 1.25x threshold. Qualify in minutes, not weeks.
            </p>
            <PromptChip label='Try it: "Can this buyer get SBA financing for a $1.5M deal?"' prompt="Can this buyer get SBA financing for a $1.5M deal? I need to pre-screen them before we go further." onSend={onSend} />
          </div>

          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-3">
              <strong className="text-[#2D3142]">Win more mandates.</strong> When competing for a listing, the advisor with localized market intelligence wins the engagement. Walk into every pitch knowing current multiples, competitive density, PE activity, and a preliminary range you can defend.
            </p>
            <PromptChip label='Try it: "Prepare market intelligence for a veterinary practice in Denver"' prompt="Prepare market intelligence for a veterinary practice in Denver. I'm pitching for the listing and need to show I know the market." onSend={onSend} />
          </div>

          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-3">
              <strong className="text-[#2D3142]">Make smaller deals profitable.</strong> Deals in the $500K&ndash;$2M range that don&apos;t justify 40 hours of manual prep become viable with SMBX. Same intelligence, same deliverable quality, fraction of the time investment. Grow your practice without growing overhead.
            </p>
            <PromptChip label='Try it: "Quick valuation for a $600K landscaping company"' prompt="Quick valuation for a $600K landscaping company. I need to see if this deal is worth my time." onSend={onSend} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Intelligence you can stake your reputation on</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          Advisors don&apos;t need more opinions. They need defensible data.
        </p>

        <div className="space-y-5 mb-6">
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Census Bureau County Business Patterns</strong> &mdash; Competitive density, establishment counts, employee benchmarks by NAICS code and geography. When Yulia says 847 HVAC businesses operate in the DFW metro, that&apos;s Census data.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Bureau of Labor Statistics</strong> &mdash; Industry employment, wage data, occupational benchmarks for compensation analysis and owner salary normalization.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">Federal Reserve (FRED)</strong> &mdash; Interest rates, economic indicators, regional economic health. Critical for SBA financing analysis and market conditions.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">SEC EDGAR</strong> &mdash; Public company filings, industry comparables for larger deals, M&amp;A activity signals.
          </p>
          <p className="text-[15px] leading-relaxed text-[#4F5D75]">
            <strong className="text-[#2D3142]">SBA Lending Data</strong> &mdash; Approval rates, loan volumes, lender activity. Used for bankability analysis and buyer financing feasibility.
          </p>
        </div>
        <p className="text-[15px] leading-relaxed text-[#4F5D75]">
          Every number Yulia cites has a source. Every valuation shows its methodology. When you present an SMBX analysis to a client, you&apos;re presenting intelligence that survives scrutiny.
        </p>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">The advisor conversation preview</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          Here&apos;s what the first five minutes of a new engagement looks like:
        </p>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-5">
          <div>
            <p className="text-[13px] font-semibold text-[#2D3142] mb-1">You:</p>
            <p className="text-[14px] leading-relaxed text-[#4F5D75]">
              &ldquo;I just signed an engagement for a commercial cleaning company in Atlanta. They&apos;re doing about $1.8M revenue, $320K SDE. Owner wants to know what he can expect.&rdquo;
            </p>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#D4714E] mb-1">Yulia:</p>
            <p className="text-[14px] leading-relaxed text-[#4F5D75]">
              &ldquo;Commercial cleaning in metro Atlanta &mdash; let me pull the market data.
            </p>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mt-2">
              At $320K SDE, current multiples for commercial cleaning with recurring contracts are running 2.8x&ndash;3.5x in Atlanta, putting the preliminary range at $896K&ndash;$1.12M.
            </p>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mt-2">
              Recurring revenue matters here &mdash; multi-year commercial contracts push toward the top of the range. SBA bankability looks strong: DSCR of approximately 1.7x on standard 7(a) at current rates, well above the 1.25x threshold. That means a broader buyer pool.
            </p>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mt-2">
              The Atlanta market is active &mdash; 1,200+ commercial cleaning operations in the MSA, but PE-backed platforms are consolidating in the Southeast.
            </p>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mt-2">
              Want me to generate a Market Intelligence Report you can share with your client?&rdquo;
            </p>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-[#4F5D75] mt-6 mb-6">
          That&apos;s the first five minutes. Localized data. Defensible range. SBA pre-qualification. Ready to share.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Try it with one of your current listings" prompt="I have a current listing I'd like to analyze. Let me tell you about the business." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-4">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Building our advisor program</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          We&apos;re actively developing partnership tiers, volume pricing, and co-branded capabilities for advisors who want to integrate SMBX into their practice.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          If you&apos;re a broker or M&amp;A advisor who wants to shape how this platform evolves, we want to hear from you.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Tell me about advisor partnership options" prompt="Tell me about advisor partnership options. I'm a broker interested in integrating SMBX into my practice." onSend={onSend} />
        </div>
      </div>
    </div>
  );
}
