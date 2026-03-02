import PromptChip from './PromptChip';

interface Props {
  onSend?: (prompt: string) => void;
}

export default function HomeContent({ onSend }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-8 animate-[fadeIn_0.5s_ease]">
      {/* Badge */}
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        The SMBX Methodology
      </span>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#2D3142] mb-2">
        The data is public.
      </h1>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#D4714E] mb-8">
        The intelligence is not.
      </h1>

      {/* Subtitle */}
      <p className="text-[18px] leading-relaxed text-[#4F5D75] max-w-2xl mb-16">
        The same market data that powers Wall Street is available to anyone. What isn&apos;t
        available is an advisor who can synthesize all of it into a deal-specific analysis in
        minutes. That&apos;s what Yulia does.
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">7 Layers of Analysis</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            Evaluated across industry structure, regional economics, financials, buyers, and risks.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Localized to Your Market</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            A plumbing deal in Phoenix differs from one in PA. Our intelligence is specific to your metro.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Calibrated by Size</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            Yulia adapts her methodology from $400K Main Street sales to $40M PE platform plays.
          </p>
        </div>
      </div>

      {/* ── Below-fold educational content ── */}

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">How Yulia analyzes your deal</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          When you describe your business or deal, Yulia doesn&apos;t give you a generic answer. She runs a structured analysis:
        </p>

        <div className="space-y-5 mb-6">
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">1. Classification</strong> &mdash; Yulia identifies your deal&apos;s size category, the right earnings metric (SDE for smaller businesses, EBITDA for larger ones), and the analytical framework that fits your situation. A $500K service business requires a fundamentally different approach than a $15M manufacturing company.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">2. Market intelligence</strong> &mdash; Using Census Bureau, BLS, and Federal Reserve data, Yulia maps your competitive landscape: how many similar businesses operate in your market, what buyers are paying in your sector, whether PE firms are actively consolidating your industry, and how regional economics affect your deal.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">3. Financial analysis</strong> &mdash; Yulia normalizes your numbers, identifies add-backs you may be missing, and calculates a valuation range grounded in current market multiples &mdash; not national averages, but data specific to your industry and geography.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">4. Deal-specific recommendations</strong> &mdash; Based on the full picture, Yulia tells you what&apos;s working in your favor, what needs attention, and what specific steps would improve your outcome.
            </p>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          Every number is sourced. Every conclusion is explainable. Ask Yulia to show her work on anything and she will.
        </p>

        <div className="flex flex-wrap gap-2">
          <PromptChip label="Show me an example analysis" prompt="Show me an example analysis. Walk me through how you'd analyze a real business." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">What makes this different from ChatGPT</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          ChatGPT is a general-purpose language model. It generates plausible-sounding text about M&amp;A, but it doesn&apos;t have access to real-time market data, doesn&apos;t follow a structured valuation methodology, and can&apos;t tell you how many competitors you have in your ZIP code.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          SMBX is purpose-built for deals. Yulia follows a seven-layer methodology, synthesizes data from sovereign U.S. government sources (Census Bureau, BLS, Federal Reserve, SEC EDGAR, SBA), and delivers traceable analysis calibrated to your specific deal. When she cites a number, it has a source. When she recommends a strategy, it has a methodology behind it.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Analyze my business &mdash; I'll tell you about it" prompt="Analyze my business. I'll tell you about it and I want to see the quality of your analysis." onSend={onSend} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12 mb-4">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Data sources</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          Every analysis Yulia delivers is grounded in authoritative data:
        </p>

        <div className="space-y-5">
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">U.S. Census Bureau</strong> &mdash; Business establishment counts, competitive density, employee benchmarks by industry and geography.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">Bureau of Labor Statistics</strong> &mdash; Industry employment, wage data, occupational benchmarks for compensation analysis and market sizing.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">Federal Reserve (FRED)</strong> &mdash; Interest rates, economic indicators, regional economic health. Critical for financing analysis and market timing.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">SEC EDGAR</strong> &mdash; Public company filings, industry comparables, M&amp;A activity signals for institutional benchmarks.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">SBA Lending Data</strong> &mdash; Approval rates, loan volumes, lender activity by geography. Used for bankability analysis and buyer financing feasibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
