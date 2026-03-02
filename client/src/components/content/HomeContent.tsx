import PromptChip from './PromptChip';

interface Props {
  onSend?: (prompt: string) => void;
}

export default function HomeContent({ onSend }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-8 animate-[fadeIn_0.5s_ease]">
      {/* Badge */}
      <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-[#D4714E] text-[12px] font-semibold uppercase tracking-wide mb-6">
        The smb<span className="uppercase">X</span>.ai Methodology
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

      {/* ── Bento Grid Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: col-span-2 */}
        <div className="md:col-span-2 bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-3">Seven layers of analysis</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
            Every deal gets evaluated across seven dimensions. Not a generic checklist &mdash; a methodology built from real transaction experience.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Industry Structure', 'Regional Economics', 'Financial Normalization', 'Buyer Landscape', 'Deal Architecture', 'Risk Factors', 'Forward Signals'].map(pill => (
              <span key={pill} className="inline-block px-3 py-1 rounded-full bg-white border border-gray-200 text-[12px] font-medium text-[#4F5D75]">
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Card 2: col-span-1 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Localized to your market</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            National averages hide what matters. A plumbing company in Phoenix and one in rural PA are fundamentally different deals. smb<span className="text-[#D4714E] font-bold">X</span>.ai intelligence is specific to your metro and competitive environment.
          </p>
        </div>

        {/* Card 3: col-span-1 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Calibrated to deal size</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            The right analysis for a $400K landscaping company differs from a $40M manufacturing platform. Yulia adapts her metrics, vocabulary, and deliverables to the deal in front of her.
          </p>
        </div>

        {/* Card 4: col-span-2, terra accent */}
        <div className="md:col-span-2 rounded-2xl p-6" style={{ background: '#FFF8F4', border: '1px solid rgba(212,113,78,0.15)' }}>
          <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Every number is sourced.</h3>
          <p className="text-[14px] leading-relaxed text-[#4F5D75] m-0">
            What your multiples are doing. How many competitors operate in your market. Whether a buyer can finance this deal through SBA.
          </p>
        </div>
      </div>

      {/* Prompt chips */}
      <div className="flex flex-wrap gap-2 mb-16">
        <PromptChip label="What would a buyer pay for my business?" prompt="What would a buyer pay for my business? I want to understand what it might be worth in today's market." onSend={onSend} />
        <PromptChip label="I'm a broker &mdash; show me what you can do" prompt="I'm a business broker. Show me how you can help me with my practice — valuations, CIMs, buyer matching, deal management." onSend={onSend} />
      </div>

      {/* ── Chat Preview Section ── */}
      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-2 text-center">See Yulia in action</h2>
        <p className="text-[15px] text-[#4F5D75] mb-8 text-center">Every number is sourced. Every analysis shows its work.</p>

        <div className="bg-white rounded-[28px] border border-gray-200 shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
          {/* User message */}
          <div className="flex justify-end mb-5">
            <div className="max-w-[85%] px-5 py-3 rounded-2xl rounded-br-sm text-[14px] leading-relaxed text-[#1A1A18]" style={{ background: '#FFF0EB', border: '1px solid rgba(212,113,78,0.18)' }}>
              I&apos;m thinking about selling my commercial HVAC company. We&apos;re in Dallas-Fort Worth, about $4.2M in revenue and $780K in adjusted EBITDA last year.
            </div>
          </div>

          {/* Yulia response */}
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white mt-0.5" style={{ background: '#D4714E' }}>Y</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#44403C] mb-1.5">Yulia</div>
              <div className="text-[14px] leading-relaxed text-[#1A1A18] space-y-3">
                <p>Commercial HVAC in DFW &mdash; strong combination right now. Let me run this against current market data through the smb<span className="text-[#D4714E] font-bold">X</span>.ai Engine.</p>
                <p>Your $780K EBITDA puts you in what we call the lower middle market, which means we&apos;re looking at EBITDA-based multiples rather than seller&apos;s discretionary earnings. For commercial HVAC in the Dallas-Fort Worth MSA, current multiples are running <strong>4.8x&ndash;6.2x</strong> based on comparable transactions and active PE interest in the sector.</p>

                {/* Callout card */}
                <div className="rounded-xl px-5 py-3 font-semibold text-[15px] text-[#1A1A18]" style={{ background: '#FFF8F4', border: '1px solid rgba(212,113,78,0.15)' }}>
                  Preliminary Enterprise Value: <strong>$3.7M &ndash; $4.8M</strong>
                </div>

                {/* Green callout */}
                <div className="rounded-xl px-4 py-3 text-[14px] leading-relaxed" style={{ background: '#F0FDF4', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <span className="font-semibold text-[#166534]">Working for you:</span>{' '}
                  <span className="text-[#4F5D75]">DFW is a high-demand market. I&apos;m tracking 14 PE-backed HVAC platforms actively acquiring in Texas. Commercial-focused operations like yours are only about 12% of the 847 HVAC businesses in the metro &mdash; that scarcity drives premiums.</span>
                </div>

                {/* Amber callout */}
                <div className="rounded-xl px-4 py-3 text-[14px] leading-relaxed" style={{ background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <span className="font-semibold text-[#92400E]">Worth examining:</span>{' '}
                  <span className="text-[#4F5D75]">Your EBITDA margin of 18.6% is solid but below the 21% industry median. There may be add-backs or operational improvements we can identify that would push your valuation meaningfully higher before you go to market.</span>
                </div>

                <p>Want me to dig into the value drivers? I can model specific improvements and show you what they&apos;d mean for your sale price.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Audience Grid ── */}
      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-2">Built for everyone in the deal.</h2>
        <p className="text-[15px] text-[#4F5D75] mb-8">Start with the intelligence that makes every decision clearer.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Selling, buying, or raising capital</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
              Whether you&apos;re a first-time seller who needs to understand the process or a serial acquirer evaluating your next target.
            </p>
            <button onClick={() => onSend?.("Tell me about my deal — I want to understand what it's worth.")} className="text-[13px] font-semibold text-[#D4714E] bg-transparent border-none cursor-pointer p-0 hover:underline" type="button">
              Tell Yulia about your deal &rarr;
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Brokers &amp; M&amp;A advisors</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
              Package listings faster. Qualify buyers instantly. Walk into every pitch with localized market intelligence that demonstrates your analytical depth.
            </p>
            <button onClick={() => onSend?.("I'm a business broker. Show me how you can help me with my practice — valuations, CIMs, buyer matching, deal management.")} className="text-[13px] font-semibold text-[#D4714E] bg-transparent border-none cursor-pointer p-0 hover:underline" type="button">
              See how advisors use smb<span className="font-bold">X</span>.ai &rarr;
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">PE, family offices &amp; search funds</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
              Screen industries, model acquisitions, and build conviction at deal-flow speed. Analysis that takes your team hours, ready in minutes.
            </p>
            <button onClick={() => onSend?.("I'm evaluating acquisition targets for a PE platform. Help me screen industries and model deals.")} className="text-[13px] font-semibold text-[#D4714E] bg-transparent border-none cursor-pointer p-0 hover:underline" type="button">
              Explore investor tools &rarr;
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Attorneys &amp; CPAs</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75] mb-4">
              Walk into every engagement with the financials, market position, and competitive landscape already organized and analyzed. Less ramp-up.
            </p>
            <button onClick={() => onSend?.("I'm a professional advisor. Help me understand how smbX.ai can support my client engagements.")} className="text-[13px] font-semibold text-[#D4714E] bg-transparent border-none cursor-pointer p-0 hover:underline" type="button">
              Start with Yulia &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ── How It Works Timeline ── */}
      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-8">How it works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-4 text-[14px] font-bold text-[#D4714E]">1</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Tell Yulia about your deal.</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75]">
              Describe what you&apos;re working on &mdash; selling a business, evaluating a target, packaging a listing, screening a market. Yulia asks smart follow-ups to understand the full picture.
            </p>
          </div>

          <div>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-4 text-[14px] font-bold text-[#D4714E]">2</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Get real intelligence, fast.</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75]">
              The smb<span className="text-[#D4714E] font-bold">X</span>.ai Engine synthesizes market data, industry benchmarks, and financial analysis into insights specific to your deal. Localized. Sourced. Actionable. Not generic &mdash; yours.
            </p>
          </div>

          <div>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-4 text-[14px] font-bold text-[#D4714E]">3</div>
            <h3 className="text-[16px] font-bold text-[#2D3142] mb-2">Go deeper when you&apos;re ready.</h3>
            <p className="text-[14px] leading-relaxed text-[#4F5D75]">
              From preliminary analysis to full deliverables &mdash; valuations, confidential memorandums, buyer matching, deal structuring, diligence prep &mdash; the intelligence scales with your deal.
            </p>
          </div>
        </div>
      </div>

      {/* ── Traceability Section ── */}
      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">Every insight is traceable. Every analysis is explainable.</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          smb<span className="text-[#D4714E] font-bold">X</span>.ai is built on data from agencies required by law to collect it &mdash; the same sovereign data sources that inform the Federal Reserve, Wall Street research desks, and the world&apos;s largest financial institutions.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          Yulia doesn&apos;t generate plausible-sounding text about your deal. She runs a structured methodology against authoritative data and delivers traceable conclusions. When she says there are 847 HVAC companies in your metro, that number comes from Census Bureau County Business Patterns data. When she cites an industry multiple, it&apos;s grounded in comparable transaction analysis.
        </p>
        <div className="rounded-xl px-5 py-3 mb-6 text-[15px] font-semibold text-[#1A1A18]" style={{ background: '#FFF8F4', border: '1px solid rgba(212,113,78,0.15)' }}>
          That&apos;s the difference between a chatbot and an intelligence engine.
        </div>
      </div>

      {/* ── Below-fold: How smbX.ai Engine analyzes your deal ── */}
      <div className="border-t border-gray-100 pt-12 mb-12">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">How the smb<span className="text-[#D4714E]">X</span>.ai Engine analyzes your deal</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          When you describe your business or deal, Yulia doesn&apos;t give you a generic answer. She runs a structured analysis:
        </p>

        <div className="space-y-5 mb-6">
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">1. Classification</strong> &mdash; Yulia identifies your deal&apos;s size category, the right earnings metric (SDE for smaller businesses, EBITDA for larger ones), and the analytical framework that fits. A $500K service business requires a fundamentally different approach than a $15M manufacturing company.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">2. Market intelligence</strong> &mdash; Using Census Bureau, BLS, and Federal Reserve data, Yulia maps your competitive landscape: how many similar businesses operate in your market, what buyers are paying, whether PE firms are consolidating your industry, and how regional economics affect your deal.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">3. Financial analysis</strong> &mdash; Yulia normalizes your numbers, identifies add-backs you may be missing, and calculates a valuation range grounded in current market multiples &mdash; specific to your industry and geography.
            </p>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[#4F5D75]">
              <strong className="text-[#2D3142]">4. Deal-specific recommendations</strong> &mdash; Based on the full picture, Yulia tells you what&apos;s working in your favor, what needs attention, and what steps would improve your outcome.
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

      {/* ── What makes this different from ChatGPT ── */}
      <div className="border-t border-gray-100 pt-12 mb-4">
        <h2 className="text-[22px] font-bold text-[#2D3142] mb-6">What makes this different from ChatGPT</h2>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-4">
          ChatGPT is a general-purpose language model. It generates plausible-sounding text about M&amp;A, but it doesn&apos;t have access to real-time market data, doesn&apos;t follow a structured valuation methodology, and can&apos;t tell you how many competitors you have in your ZIP code.
        </p>
        <p className="text-[15px] leading-relaxed text-[#4F5D75] mb-6">
          smb<span className="text-[#D4714E] font-bold">X</span>.ai is purpose-built for deals. Yulia follows a seven-layer methodology, synthesizes data from sovereign U.S. government sources (Census Bureau, BLS, Federal Reserve, SEC EDGAR, SBA), and delivers traceable analysis calibrated to your specific deal. When she cites a number, it has a source. When she recommends a strategy, it has a methodology behind it.
        </p>
        <div className="flex flex-wrap gap-2">
          <PromptChip label="Analyze my business &mdash; I'll tell you about it" prompt="Analyze my business. I'll tell you about it and I want to see the quality of your analysis." onSend={onSend} />
        </div>
      </div>
    </div>
  );
}
