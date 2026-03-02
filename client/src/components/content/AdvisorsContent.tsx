interface Props {
  onSend?: (prompt: string) => void;
}

export default function AdvisorsContent({ onSend }: Props) {
  return (
    <div className="bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white pb-32 min-h-screen">

      {/* HERO */}
      <section className="px-6 pt-12 md:pt-24 pb-16 max-w-6xl mx-auto w-full relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] text-xs font-bold tracking-wider uppercase mb-8 border border-[#FBE3D9]">
          For Deal Professionals
        </div>
        <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8 text-left">
          Your expertise closes deals.<br />
          <span className="text-[#D4714E]">Now close more of them.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl leading-relaxed mb-12 text-left">
          smbX.ai gives M&amp;A advisors, brokers, and deal professionals the intelligence infrastructure to serve more clients, package better deals, and move through engagements faster.
        </p>
        <div className="flex flex-wrap justify-start gap-3 max-w-3xl">
          <Suggestion text="Package a new listing" onClick={() => onSend?.("I'm a broker. I need to package a new listing for a commercial cleaning company.")} />
          <Suggestion text="Pre-screen a buyer for SBA" onClick={() => onSend?.("I need to pre-screen a buyer's financials for an SBA 7(a) loan.")} />
          <Suggestion text="Generate a CIM" onClick={() => onSend?.("I need to generate a CIM from these raw financials.")} />
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
              <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Advisor Advantage</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Intelligence on demand<br /><span className="text-[#D4714E]">for every engagement.</span></h2>
              <p className="text-[#6E6A63] text-lg leading-relaxed">
                Great advisors are limited by the same thing: hours in the day. The smbX.ai Engine handles the data assembly, financial modeling, and formatting, so you can focus on negotiations and strategic counsel.
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
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm relative overflow-hidden group">
              <h3 className="text-2xl font-bold mb-4 relative z-10">Package a new listing in minutes</h3>
              <p className="text-[#6E6A63] mb-8 relative z-10 max-w-lg leading-relaxed">A new seller engagement used to mean days of manual research. Tell Yulia about the business and get instant market intelligence, preliminary valuations, and add-back identification.</p>
              <div className="flex flex-wrap gap-2 relative z-10">
                <Badge text="Instant Valuations" /><Badge text="Market Comps" /><Badge text="SBA Pre-screen" />
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col">
              <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">01</div>
              <h3 className="text-xl font-bold mb-3">Qualify buyers instantly</h3>
              <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">Pre-screen buyer financials against SBA requirements. Model DSCR and assess financing feasibility before scheduling a call.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col md:col-span-3 lg:col-span-1">
              <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">02</div>
              <h3 className="text-xl font-bold mb-3">Make smaller deals profitable</h3>
              <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">The infrastructure that makes a $10M engagement great makes a $1M engagement viable. Serve deals you&apos;d normally turn away.</p>
            </div>
            <div className="bg-[#D4714E] rounded-3xl p-8 flex items-center justify-between md:col-span-2 text-white shadow-md">
              <div className="max-w-lg">
                <h3 className="text-3xl font-bold mb-3">Present intelligence under your brand.</h3>
                <p className="text-orange-100 font-medium leading-relaxed">Every deliverable Yulia generates&mdash;valuations, Market Intelligence Reports, CIMs&mdash;can be white-labeled with your firm&apos;s identity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE PREVIEW */}
      <section className="px-6 py-24 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">See how a broker preps a listing</h2>
          <p className="text-[#6E6A63] text-lg">The first five minutes of a new engagement.</p>
        </div>
        <div className="bg-[#F8F6F1] rounded-[40px] p-6 md:p-10 border border-[#EAE6DF] shadow-xl max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="self-end bg-[#D4714E] text-white p-6 rounded-[24px] rounded-br-[8px] max-w-[85%] md:max-w-[75%] shadow-md text-[16px] leading-relaxed">
              I just signed an engagement for a commercial cleaning company in Atlanta. They&apos;re doing about $1.8M revenue, $320K SDE. Need to prep for the pricing convo.
            </div>
            <div className="self-start flex gap-4 max-w-[95%] md:max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#D4714E] font-black text-sm shrink-0 shadow-sm mt-1">Y</div>
              <div className="bg-white border border-[#EAE6DF] p-6 md:p-8 rounded-[24px] rounded-tl-[8px] shadow-md text-[#1A1A18] text-[16px] leading-relaxed">
                <p className="mb-4">Good engagement &mdash; let me pull the market intelligence for commercial cleaning in the Atlanta MSA.</p>
                <p className="mb-6">At $320K SDE, this is solidly Main Street. Current SDE multiples for commercial cleaning with recurring contracts are running <strong className="bg-[#FFF0EB] text-[#D4714E] px-1 rounded">2.8x&ndash;3.5x</strong> in metro Atlanta.</p>
                <div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="text-sm text-[#6E6A63] uppercase tracking-wider font-bold mb-1">Preliminary Range</div>
                  <div className="text-3xl font-black text-[#1A1A18]">$896K &ndash; $1.12M</div>
                </div>
                <div className="space-y-4 text-[15px] mb-6">
                  <div className="flex items-start gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100">
                    <div className="mt-1 font-black text-green-600">✓</div>
                    <div><strong>SBA Bankability:</strong> Looks strong. At $1M enterprise value, DSCR is approx 1.7x on a standard 7(a), well above the 1.25x minimum. Broader buyer pool.</div>
                  </div>
                </div>
                <div className="pt-4 font-bold text-[#D4714E]">Want me to generate a white-labeled Market Intelligence Report you can share with your client?</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EMPOWERMENT */}
      <section className="px-6 py-24 bg-white border-t border-[#EAE6DF]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-[40px] p-8 md:p-12 shadow-xl shadow-[#1A1A18]/5">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The infrastructure of a mega-firm. Right in your practice.</h2>
              <p className="text-lg text-[#6E6A63] leading-relaxed">
                You don&apos;t need a floor full of junior analysts to deliver institutional-grade service. smbX.ai gives you the leverage to operate at the highest level of the profession.
              </p>
            </div>
            <div className="space-y-6">
              <StepCard num="1" title="Win More Mandates" desc="When you're competing for a listing, the advisor who shows up with localized market intelligence, industry benchmarks, and a clear methodology wins." />
              <StepCard num="2" title="Scale Your Bandwidth" desc="Every hour spent formatting CIMs and building comp tables is an hour not spent negotiating or finding new clients. Automate the manual work." />
              <StepCard num="3" title="Protect Your Deal Flow" desc="Deals die in financing. By pre-screening buyers and targets against live SBA lending requirements, you ensure you only spend time on deals that can actually close." />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Sub-components ── */

function Suggestion({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white border border-[#EAE6DF] text-[#6E6A63] text-[13px] md:text-sm font-medium px-4 py-2.5 rounded-full hover:border-[#D4714E] hover:text-[#D4714E] hover:shadow-sm transition-all cursor-pointer text-left" type="button">
      &ldquo;{text}&rdquo;
    </button>
  );
}

function Badge({ text }: { text: string }) {
  return <div className="bg-[#F8F6F1] border border-[#EAE6DF] text-[#6E6A63] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">{text}</div>;
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-6 items-start p-6 bg-[#FDFCFB] rounded-2xl border border-[#EAE6DF]">
      <div className="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center font-black text-xl shrink-0">{num}</div>
      <div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-[#6E6A63] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
