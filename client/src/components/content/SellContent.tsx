import { Suggestion, Badge, OutcomeCard, StepCard } from './ui';

interface Props {
  onSend?: (prompt: string) => void;
}

export default function SellContent({ onSend }: Props) {
  return (
    <div className="bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white pb-32 min-h-screen w-full">

      {/* HERO */}
      <section className="px-6 pt-12 md:pt-24 pb-16 max-w-6xl mx-auto w-full relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] text-xs font-bold tracking-wider uppercase mb-8 border border-[#FBE3D9]">
          For Business Owners
        </div>
        <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8 text-left">
          Know your number.<br />
          <span className="text-[#D4714E]">Before you negotiate.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl leading-relaxed mb-12 text-left">
          Most owners leave money on the table. Yulia calculates your true adjusted earnings, finds hidden add-backs, and generates a defensible valuation in minutes.
        </p>
        <div className="flex flex-wrap justify-start gap-3 max-w-3xl">
          <Suggestion text="Value my $1.8M pest control business" onClick={() => onSend?.("I want to sell my pest control business doing $1.8M in revenue. What is it worth?")} />
          <Suggestion text="Walk me through the selling process" onClick={() => onSend?.("Walk me through the selling process. Where do I start?")} />
          <Suggestion text="What are common add-backs?" onClick={() => onSend?.("What are common add-backs I should be looking for in my financials?")} />
        </div>
      </section>

      {/* TICKER */}
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

      {/* INFOGRAPHIC */}
      <section className="px-6 py-24 bg-[#F8F6F1] text-[#1A1A18] border-b border-[#EAE6DF]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 md:flex justify-between items-end gap-8">
            <div className="max-w-2xl">
              <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Seller Advantage</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Stop guessing.<br /><span className="text-[#D4714E]">Start proving.</span></h2>
              <p className="text-[#6E6A63] text-lg leading-relaxed">
                Selling a business is the most consequential financial decision most owners make. smbX.ai doesn&apos;t just estimate your value&mdash;it builds the defensible, data-backed case to justify your asking price.
              </p>
            </div>
            <div className="mt-8 md:mt-0 flex items-center gap-4 bg-white px-6 py-5 rounded-2xl border border-[#EAE6DF] shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#1A1A18] flex items-center justify-center text-white font-black text-lg">$</div>
              <div>
                <div className="text-xs text-[#A9A49C] uppercase tracking-wider font-bold">Valuation Engine</div>
                <div className="font-bold text-lg text-[#1A1A18]">SDE &amp; EBITDA Math</div>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm relative overflow-hidden group">
              <h3 className="text-2xl font-bold mb-4 relative z-10">Find the hidden money in your financials</h3>
              <p className="text-[#6E6A63] mb-8 relative z-10 max-w-lg leading-relaxed">Your tax return isn&apos;t your valuation. Yulia identifies owner salaries, personal vehicles, one-time expenses, and family benefits to calculate your true Seller&apos;s Discretionary Earnings (SDE).</p>
              <div className="flex flex-wrap gap-2 relative z-10">
                <Badge text="Identify Add-backs" /><Badge text="Normalize EBITDA" /><Badge text="Justify Multiples" />
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col">
              <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">01</div>
              <h3 className="text-xl font-bold mb-3">SBA Pre-qualification</h3>
              <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">Can a buyer actually finance your asking price? Yulia models live SBA rates and DSCR so you know before you list.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col md:col-span-3 lg:col-span-1">
              <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">02</div>
              <h3 className="text-xl font-bold mb-3">Market Intelligence</h3>
              <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">Know exactly how many competitors operate in your ZIP code and whether Private Equity is rolling up your industry.</p>
            </div>
            <div className="bg-[#D4714E] rounded-3xl p-8 flex items-center justify-between md:col-span-2 text-white shadow-md">
              <div className="max-w-lg">
                <h3 className="text-3xl font-bold mb-3">Institutional CIMs in minutes, not weeks.</h3>
                <p className="text-orange-100 font-medium leading-relaxed">Turn your raw financials into a 25-page Confidential Information Memorandum built to withstand buyer scrutiny.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE PREVIEW */}
      <section className="px-6 py-24 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Finding the hidden money</h2>
          <p className="text-[#6E6A63] text-lg">See how Yulia extracts your actual Seller&apos;s Discretionary Earnings (SDE).</p>
        </div>
        <div className="bg-[#F8F6F1] rounded-[40px] p-6 md:p-10 border border-[#EAE6DF] shadow-xl max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="self-end bg-[#D4714E] text-white p-6 rounded-[24px] rounded-br-[8px] max-w-[85%] md:max-w-[75%] shadow-md text-[16px] leading-relaxed">
              I&apos;m thinking of selling my plumbing business. We did $1.2M last year. Tax return shows $50K net income, but I take a $120K salary, and the business pays for my truck and family health insurance.
            </div>
            <div className="self-start flex gap-4 max-w-[95%] md:max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#D4714E] font-black text-sm shrink-0 shadow-sm mt-1">Y</div>
              <div className="bg-white border border-[#EAE6DF] p-6 md:p-8 rounded-[24px] rounded-tl-[8px] shadow-md text-[#1A1A18] text-[16px] leading-relaxed">
                <p className="mb-6">This is exactly why you shouldn&apos;t use your tax return to price your business. Let&apos;s calculate your actual <strong>Seller&apos;s Discretionary Earnings (SDE)</strong>.</p>
                <div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-2xl p-6 mb-6 shadow-sm font-mono text-sm">
                  <div className="text-xs font-sans text-[#6E6A63] uppercase tracking-wider font-bold mb-4 border-b border-[#EAE6DF] pb-2">Add-back Schedule (Draft)</div>
                  <div className="flex justify-between mb-2"><span>Reported Net Income:</span> <span className="font-bold">$50,000</span></div>
                  <div className="flex justify-between mb-2 text-green-700"><span>+ Owner Salary:</span> <span>$120,000</span></div>
                  <div className="flex justify-between mb-2 text-green-700"><span>+ Owner Vehicle:</span> <span>$12,000</span></div>
                  <div className="flex justify-between mb-4 text-green-700 border-b border-[#EAE6DF] pb-3"><span>+ Family Health Ins.:</span> <span>$18,000</span></div>
                  <div className="flex justify-between pt-1">
                    <span className="font-bold font-sans">True SDE (Cash Flow):</span>
                    <span className="font-bold text-[#D4714E] text-lg">$200,000</span>
                  </div>
                </div>
                <div className="space-y-4 text-[15px] mb-6">
                  <div className="flex items-start gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100">
                    <div className="mt-1 font-black text-green-600">✓</div>
                    <div><strong>Valuation Impact:</strong> By identifying just those basic add-backs, your valuation basis jumped from $50K to $200K. At a standard 2.5x&ndash;3.2x multiple, your enterprise value is roughly <strong>$500K to $640K</strong>.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="px-6 py-24 bg-white border-y border-[#EAE6DF]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Deliverables</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What you actually walk away with.</h2>
            <p className="text-[#6E6A63] text-lg max-w-2xl mx-auto">You don&apos;t just get chat advice. Yulia instantly generates the exact institutional-grade collateral you need to market and close your business.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <OutcomeCard tag="Valuations" title="Defensible Valuation Reports" desc="Get a multi-methodology valuation report (SDE, EBITDA, DCF) perfectly formatted with comparable transaction data to prove your asking price." />
            <OutcomeCard tag="Marketing" title="Blind Teasers & CIMs" desc="We generate anonymous blind teasers to test the market, and 25-page Confidential Information Memorandums (CIMs) for verified buyers." />
            <OutcomeCard tag="Financing" title="SBA Bankability Models" desc="Prove to buyers that your deal is financeable. Get pre-filled Debt Service Coverage Ratio models based on live federal interest rates." />
            <OutcomeCard tag="Collaboration" title="Multi-Party Deal Rooms" desc="A single secure space where your attorney, CPA, and prospective buyers can review the documents Yulia generated." />
          </div>
        </div>
      </section>

      {/* EMPOWERMENT */}
      <section className="px-6 py-24 bg-[#F8F6F1] border-t border-[#EAE6DF]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-[#EAE6DF] rounded-[40px] p-8 md:p-12 shadow-xl shadow-[#1A1A18]/5">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The power to close on your terms.</h2>
              <p className="text-lg text-[#6E6A63] leading-relaxed">Whether you are a first-time seller or exiting your third company, smbX.ai gives you the superpower to execute flawlessly. It&apos;s absolute clarity when it matters most.</p>
            </div>
            <div className="space-y-6">
              <StepCard num="1" title="Absolute Certainty" desc="No more trusting a buyer who lowballs you. Your valuation is backed by live federal market data." />
              <StepCard num="2" title="Maximum Value" desc="Discover the hidden money in your financials. Legitimate add-backs can effortlessly add hundreds of thousands to your enterprise value." />
              <StepCard num="3" title="Unstoppable Momentum" desc="Deals die waiting for paperwork. Generate your CIM, LOI responses, and SBA models in seconds to keep excitement high." />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

