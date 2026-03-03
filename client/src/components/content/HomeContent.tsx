import { Suggestion, Badge, OutcomeCard } from './ui';

interface Props {
  onSend?: (prompt: string) => void;
}

export default function HomeContent({ onSend }: Props) {
  return (
    <div className="bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white pb-32 min-h-screen w-full">

      {/* HERO SECTION */}
      <section className="px-6 pt-12 md:pt-24 pb-16 max-w-6xl mx-auto w-full relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] text-xs font-bold tracking-wider uppercase mb-8 border border-[#FBE3D9]">
          The new standard for M&amp;A
        </div>

        <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8 text-left">
          Buy or sell a business.<br />
          <span className="text-[#D4714E]">Just by chatting.</span>
        </h1>

        <p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl leading-relaxed mb-12 text-left">
          Our AI intelligence and deal automation take the guesswork out of buying or selling any business. Just type, and Yulia runs the numbers.
        </p>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-start gap-3 max-w-3xl">
          <Suggestion text="What would a buyer pay for my business?" onClick={() => onSend?.("What would a buyer pay for my business?")} />
          <Suggestion text="Walk me through selling my company" onClick={() => onSend?.("Walk me through selling my company")} />
          <Suggestion text="Find acquisition targets in my industry" onClick={() => onSend?.("Find acquisition targets in my industry")} />
          <Suggestion text="I'm a broker — show me what you can do" onClick={() => onSend?.("I'm a broker — show me what you can do")} />
        </div>
      </section>

      {/* TRUST TICKER */}
      <div className="border-y border-[#EAE6DF] bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6 text-sm font-bold text-[#A9A49C] tracking-widest uppercase">
          <span className="hidden md:inline-block">Powered By:</span>
          <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> U.S. Census</span>
          <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> BLS</span>
          <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> Federal Reserve</span>
          <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> SEC EDGAR</span>
          <span className="text-[#1A1A18] flex items-center gap-2"><span className="text-[#D4714E] text-lg leading-none">&middot;</span> SBA</span>
        </div>
      </div>

      {/* THE INFOGRAPHIC: WHY IT WORKS */}
      <section className="px-6 py-24 bg-[#F8F6F1] text-[#1A1A18] border-b border-[#EAE6DF]">
        <div className="max-w-6xl mx-auto">

          <div className="mb-16 md:flex justify-between items-end gap-8">
            <div className="max-w-2xl">
              <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">Why it works</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">The data is public.<br /><span className="text-[#D4714E]">The advantage is yours.</span></h2>
              <p className="text-[#6E6A63] text-lg leading-relaxed">
                smbX.ai doesn&apos;t just aggregate data&mdash;it acts as your proactive advisor. Yulia finds hidden add-backs, models SBA financing, and generates presentation-ready documents so you can negotiate from a position of absolute certainty.
              </p>
            </div>
            <div className="mt-8 md:mt-0 flex items-center gap-4 bg-white px-6 py-5 rounded-2xl border border-[#EAE6DF] shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#1A1A18] flex items-center justify-center text-white font-black text-lg">X</div>
              <div>
                <div className="text-xs text-[#A9A49C] uppercase tracking-wider font-bold">Proprietary Tech</div>
                <div className="font-bold text-lg text-[#1A1A18]">smb<span className="text-[#D4714E]">X</span>.ai Engine</div>
              </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Box 1: Add-backs & Value */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF0EB] rounded-full blur-3xl -mr-20 -mt-20 opacity-60" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Uncover hidden enterprise value</h3>
              <p className="text-[#6E6A63] mb-8 relative z-10 max-w-lg leading-relaxed">
                Most owners leave money on the table. Yulia evaluates your deal across seven critical dimensions to find missed add-backs, optimize your EBITDA, and maximize your final sale price.
              </p>
              <div className="flex flex-wrap gap-2 relative z-10">
                <Badge text="Identify Add-backs" />
                <Badge text="Optimize Multiples" />
                <Badge text="Mitigate Risk" />
                <Badge text="Structure Earnouts" />
              </div>
            </div>

            {/* Box 2: Local Leverage */}
            <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col">
              <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">01</div>
              <h3 className="text-xl font-bold mb-3">Negotiate with local leverage</h3>
              <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">
                National averages are useless. Get the exact competitive density, active PE roll-ups, and transaction multiples for your specific ZIP code.
              </p>
            </div>

            {/* Box 3: SBA / DSCR */}
            <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col md:col-span-3 lg:col-span-1">
              <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">02</div>
              <h3 className="text-xl font-bold mb-3">Pass lender scrutiny instantly</h3>
              <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">
                Know if your deal pencils before drafting an LOI. Yulia runs live SBA bankability checks and Debt Service Coverage Ratios (DSCR) in seconds.
              </p>
            </div>

            {/* Box 4: Speed */}
            <div className="bg-[#D4714E] rounded-3xl p-8 flex items-center justify-between md:col-span-2 text-white shadow-md">
              <div className="max-w-lg">
                <h3 className="text-3xl font-bold mb-3">Weeks of advisory work. Done in minutes.</h3>
                <p className="text-orange-100 font-medium leading-relaxed">
                  Stop waiting on analysts. Generate defensible valuations, 25-page Confidential Information Memos (CIMs), and localized market reports at the speed of thought.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE PREVIEW SECTION */}
      <section className="px-6 py-24 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">See Yulia in action</h2>
          <p className="text-[#6E6A63] text-lg">Every number is sourced. Every analysis shows its work.</p>
        </div>

        <div className="bg-[#F8F6F1] rounded-[40px] p-6 md:p-10 border border-[#EAE6DF] shadow-xl max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="self-end bg-[#D4714E] text-white p-6 rounded-[24px] rounded-br-[8px] max-w-[85%] md:max-w-[75%] shadow-md text-[16px] leading-relaxed">
              I&apos;m thinking about selling my commercial HVAC company. We&apos;re in Dallas-Fort Worth, about $4.2M in revenue and $780K in adjusted EBITDA last year.
            </div>
            <div className="self-start flex gap-4 max-w-[95%] md:max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#D4714E] font-black text-sm shrink-0 shadow-sm mt-1">Y</div>
              <div className="bg-white border border-[#EAE6DF] p-6 md:p-8 rounded-[24px] rounded-tl-[8px] shadow-md text-[#1A1A18] text-[16px] leading-relaxed">
                <p className="mb-4">Commercial HVAC in DFW &mdash; strong combination right now. Let me run this against current market data through the smbX.ai engine.</p>
                <p className="mb-6">Your $780K EBITDA puts you in what we call the lower middle market, which means we&apos;re looking at EBITDA-based multiples rather than seller&apos;s discretionary earnings. For commercial HVAC in the Dallas-Fort Worth MSA, current multiples are running <strong className="bg-[#FFF0EB] text-[#D4714E] px-1 rounded">4.8x&ndash;6.2x</strong> based on comparable transactions and active PE interest in the sector.</p>

                <div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="text-sm text-[#6E6A63] uppercase tracking-wider font-bold mb-1">Preliminary Enterprise Value</div>
                  <div className="text-3xl font-black text-[#1A1A18]">$3.7M &ndash; $4.8M</div>
                </div>

                <div className="space-y-4 text-[15px] mb-6">
                  <div className="flex items-start gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100">
                    <div className="mt-1 font-black text-green-600">✓</div>
                    <div><strong>Working for you:</strong> DFW is a high-demand market. I&apos;m tracking 14 PE-backed HVAC platforms actively acquiring in Texas. Commercial-focused operations like yours are only about 12% of the 847 HVAC businesses in the metro &mdash; that scarcity drives premiums.</div>
                  </div>
                  <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <div className="mt-1 font-black text-amber-600">!</div>
                    <div><strong>Worth examining:</strong> Your EBITDA margin of 18.6% is solid but below the 21% industry median. There may be add-backs or operational improvements we can identify that would push your valuation meaningfully higher before you go to market.</div>
                  </div>
                </div>
                <div className="pt-4 font-bold text-[#D4714E]">Want me to dig into the value drivers? I can model specific improvements and show you what they&apos;d mean for your sale price.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUTCOMES SECTION: TANGIBLE DELIVERABLES */}
      <section className="px-6 py-24 bg-white border-y border-[#EAE6DF]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Deliverables</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What you actually walk away with.</h2>
            <p className="text-[#6E6A63] text-lg max-w-2xl mx-auto">You don&apos;t just get chat advice. Yulia instantly generates the exact institutional-grade collateral you need to close the deal.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <OutcomeCard
              tag="Valuations"
              title="Defensible Valuation Reports"
              desc="Stop guessing. Get a multi-methodology valuation report (SDE, EBITDA, DCF) perfectly formatted with comparable transaction data to prove your asking price."
            />
            <OutcomeCard
              tag="Documents"
              title="25-Page CIMs & Pitch Decks"
              desc="We generate professional Confidential Information Memorandums and buyer pitch decks using your raw financials, ready to hand to prospective buyers."
            />
            <OutcomeCard
              tag="Financing"
              title="SBA Loan Math & DSCR Models"
              desc="Get pre-filled Debt Service Coverage Ratio models based on live federal interest rates. Know exactly what a lender will say before you apply."
            />
            <OutcomeCard
              tag="Collaboration"
              title="Multi-Party Deal Rooms"
              desc="A single secure space where your attorney, CPA, and buyers can review the documents Yulia generated, saving thousands in billable hours."
            />
          </div>
        </div>
      </section>

      {/* EMPOWERMENT SECTION */}
      <section className="px-6 py-24 bg-[#F8F6F1] border-t border-[#EAE6DF]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-[#EAE6DF] rounded-[40px] p-8 md:p-12 shadow-xl shadow-[#1A1A18]/5">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The power of an M&amp;A firm, right in your pocket.</h2>
              <p className="text-lg text-[#6E6A63] leading-relaxed">
                Whether you are a first-time seller, a seasoned acquirer, or an expert advisor, smbX.ai gives you the superpower to execute flawlessly. It&apos;s not just data&mdash;it&apos;s absolute clarity when it matters most.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-6 items-start p-6 bg-[#FDFCFB] rounded-2xl border border-[#EAE6DF]">
                <div className="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center font-black text-xl shrink-0">1</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Unshakeable Confidence</h4>
                  <p className="text-[#6E6A63] leading-relaxed">Walk into every negotiation knowing the exact math. Your valuation is backed by live federal data, giving you the certainty to stand firm on your price.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start p-6 bg-[#FDFCFB] rounded-2xl border border-[#EAE6DF]">
                <div className="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center font-black text-xl shrink-0">2</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Maximum Value</h4>
                  <p className="text-[#6E6A63] leading-relaxed">Discover the hidden money in your financials. Instantly identifying legitimate add-backs can effortlessly add hundreds of thousands of dollars to your enterprise value.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start p-6 bg-[#FDFCFB] rounded-2xl border border-[#EAE6DF]">
                <div className="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center font-black text-xl shrink-0">3</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Unstoppable Momentum</h4>
                  <p className="text-[#6E6A63] leading-relaxed">Deals die waiting for paperwork. Generate your CIM, LOI, and SBA models in seconds, keeping the excitement high and getting everyone to the closing wire faster.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

