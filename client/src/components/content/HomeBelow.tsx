interface HomeBelowProps {
  onChipClick: (text: string) => void;
}

export default function HomeBelow({ onChipClick }: HomeBelowProps) {
  return (
    <>
      {/* ═══ Section 1: THE PROBLEM (SOUND FAMILIAR?) ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7]" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">SOUND FAMILIAR?</span>
            <h2 className="text-[24px] md:text-[36px] font-extrabold mt-2 md:max-w-[720px] md:mx-auto" style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              You have questions. They shouldn&apos;t take weeks to answer.
            </h2>
          </div>
          <div className="md:max-w-[680px] md:mx-auto space-y-5">
            <div className="space-y-1">
              <p className="text-[13px] font-bold tracking-[0.06em] uppercase text-[#D4714E] m-0">If you&apos;re selling:</p>
              <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0 italic" style={{ lineHeight: 1.65 }}>
                &ldquo;What is my business actually worth? Am I leaving money on the table? What&apos;s the process? How long does it take? Do I need a broker? What do buyers even look for?&rdquo;
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[13px] font-bold tracking-[0.06em] uppercase text-[#D4714E] m-0">If you&apos;re buying:</p>
              <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0 italic" style={{ lineHeight: 1.65 }}>
                &ldquo;Is this asking price justified? Can I finance it? What are the real risks? What does the competitive landscape look like? Should I pursue this one or keep looking?&rdquo;
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[13px] font-bold tracking-[0.06em] uppercase text-[#D4714E] m-0">If you&apos;re advising:</p>
              <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0 italic" style={{ lineHeight: 1.65 }}>
                &ldquo;How do I package this listing faster? Is this buyer qualified? Can I take on more deals without burning out?&rdquo;
              </p>
            </div>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0 pt-2" style={{ lineHeight: 1.65 }}>
              These aren&apos;t hard questions. But right now, getting real answers takes weeks of analysis, thousands of dollars, and a team of specialists.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#1A1A18] font-bold m-0" style={{ lineHeight: 1.65 }}>
              Yulia answers them in minutes. With real data. Specific to your deal.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: WHAT YULIA DOES FOR YOU ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">THE DEAL OS</span>
            <h2 className="text-[26px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>Your deal. Start to finish. One conversation.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3 md:max-w-[580px] md:mx-auto" style={{ lineHeight: 1.55 }}>
              Tell Yulia what you&apos;re working on. She builds the intelligence, generates the documents, and guides you through every step.
            </p>
          </div>
          {/* Mobile: clean list */}
          <div className="md:hidden">
            {[
              { n: '01', title: 'Know exactly where you stand.', body: 'What\u2019s your business worth? Can this acquisition be financed? What does the market look like? Yulia builds a complete picture of your deal \u2014 using live federal data from Census, BLS, SBA, and SEC \u2014 specific to your industry, your geography, and your numbers. Not estimates. Not national averages. YOUR data.' },
              { n: '02', title: 'Find the value others miss.', body: 'Sellers: most owners miss $100K\u2013$500K in legitimate add-backs hiding in their tax returns. Yulia finds them line by line. Buyers: Yulia validates the seller\u2019s numbers against federal benchmarks. If the margins don\u2019t match the industry, you\u2019ll know before you waste months on due diligence.' },
              { n: '03', title: 'Get a number you can defend.', body: 'A multi-methodology valuation built on real comparable transactions, calibrated industry multiples, and local market conditions. The kind of number that holds up when an attorney challenges it, a lender underwrites against it, or you\u2019re sitting across the closing table.' },
              { n: '04', title: 'Know your next move. And the one after that.', body: 'Yulia doesn\u2019t stop at the number. She maps your entire path: what to optimize, how to structure the deal, who the right counterparties are, what your negotiation leverage looks like, and what to expect at every stage.' },
              { n: '05', title: 'Stay covered through close \u2014 and beyond.', body: 'Sellers: Yulia manages the process through LOI, due diligence, and closing. Buyers: she follows you 180 days past close with a customized value creation plan. This isn\u2019t a one-time report. It\u2019s your deal partner from first question to fully realized.' },
            ].map((s, i) => (
              <div key={s.n} className={`flex gap-3.5 py-4 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <span className="text-[28px] font-extrabold text-[#D4714E] opacity-70 min-w-[36px] leading-none">{s.n}</span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1A1A18] mb-1">{s.title}</h3>
                  <p className="text-[14px] font-normal text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: 3+2 card grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-4">
              {[
                { n: '01', title: 'Know exactly where you stand.', body: 'Yulia builds a complete picture of your deal \u2014 using live federal data from Census, BLS, SBA, and SEC \u2014 specific to your industry, your geography, and your numbers. Not estimates. YOUR data.' },
                { n: '02', title: 'Find the value others miss.', body: 'Sellers: most owners miss $100K\u2013$500K in add-backs. Yulia finds them. Buyers: Yulia validates the seller\u2019s numbers against federal benchmarks. If the margins don\u2019t match, you\u2019ll know.' },
                { n: '03', title: 'Get a number you can defend.', body: 'Multi-methodology valuation built on real comparable transactions, calibrated industry multiples, and local market conditions. Holds up at the closing table.' },
              ].map(s => (
                <div key={s.n} className="bg-white border border-[#E5E5E5] rounded-2xl p-6">
                  <span className="text-[32px] font-extrabold text-[#D4714E] opacity-70 leading-none block mb-3">{s.n}</span>
                  <h3 className="text-[16px] font-bold mb-2">{s.title}</h3>
                  <p className="text-[14px] text-[#6E6A63] m-0">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { n: '04', title: 'Know your next move. And the one after that.', body: 'Yulia maps your entire path: what to optimize, how to structure the deal, who the right counterparties are, what your negotiation leverage looks like, and what to expect at every stage.' },
                { n: '05', title: 'Stay covered through close \u2014 and beyond.', body: 'Sellers: LOI through closing. Buyers: 180 days of post-acquisition value creation. This isn\u2019t a one-time report. It\u2019s your deal partner from first question to fully realized.' },
              ].map(s => (
                <div key={s.n} className="bg-white border border-[#E5E5E5] rounded-2xl p-6">
                  <span className="text-[32px] font-extrabold text-[#D4714E] opacity-70 leading-none block mb-3">{s.n}</span>
                  <h3 className="text-[16px] font-bold mb-2">{s.title}</h3>
                  <p className="text-[14px] text-[#6E6A63] m-0">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: CONVERSATION PREVIEW ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-20 md:pb-16 md:px-8">
        <div className="md:max-w-[720px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">SEE IT HAPPEN</span>
            <h2 className="text-[24px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>47 seconds. Real intelligence.</h2>
          </div>

          {/* User message */}
          <div className="flex justify-end mb-3.5">
            <div className="bg-[#FFF0EB] border border-[rgba(212,113,78,0.15)] p-3.5 ml-8 md:ml-0 md:max-w-[80%]" style={{ borderRadius: '20px 20px 4px 20px' }}>
              <p className="text-[15px] md:text-[16px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.55 }}>
                I&apos;m thinking about selling my commercial HVAC company. We&apos;re in Dallas-Fort Worth, about $4.2M in revenue and $780K in adjusted EBITDA last year.
              </p>
            </div>
          </div>

          {/* Yulia response */}
          <div className="flex items-start gap-2.5">
            <div className="w-[30px] h-[30px] rounded-full bg-[#1A1A18] text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-1">Y</div>
            <div className="bg-[#F7F7F7] p-3.5 flex-1" style={{ borderRadius: '20px 20px 20px 4px' }}>
              <p className="text-[15px] md:text-[16px] font-medium text-[#1A1A18] m-0 mb-3" style={{ lineHeight: 1.55 }}>
                Commercial HVAC in DFW &mdash; that&apos;s a strong combination right now. Your $780K EBITDA puts you in the institutional range. Let me run the numbers...
              </p>
              {/* Valuation card */}
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 mt-3.5">
                <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#6E6A63]">Preliminary Enterprise Value</div>
                <div className="text-[32px] md:text-[36px] font-extrabold tracking-[-0.03em] text-[#1A1A18]">$3.7M &ndash; $4.8M</div>
                <div className="text-[12px] font-medium text-[#6E6A63]">EBITDA &times; Industry Multiple (4.8&ndash;6.2&times;) &middot; Census CBP &middot; BLS QCEW</div>
              </div>
              {/* Green insight */}
              <div className="mt-2 p-2.5" style={{ background: 'rgba(74,222,128,0.06)', borderLeft: '3px solid #22C55E', borderRadius: '0 10px 10px 0' }}>
                <p className="text-[13px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.5 }}>DFW has 847 HVAC businesses per Census data, but only ~12% are commercial-focused. 14 active PE roll-up platforms in Texas. You&apos;re in a seller&apos;s market.</p>
              </div>
              {/* Amber insight */}
              <div className="mt-2 p-2.5" style={{ background: 'rgba(234,179,8,0.06)', borderLeft: '3px solid #EAB308', borderRadius: '0 10px 10px 0' }}>
                <p className="text-[13px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.5 }}>Your 18.6% EBITDA margin is slightly below the 21% sector median. Optimization here could move your enterprise value $200K&ndash;$400K.</p>
              </div>
            </div>
          </div>

          <p className="text-[13px] md:text-[14px] font-semibold text-[#6E6A63] mt-5 md:text-center">
            This is what institutional deal intelligence looks like &mdash; for any business, any size, in a single conversation.
          </p>
        </div>
      </section>

      {/* ═══ Section 4: YOUR DELIVERABLES ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">YOUR DELIVERABLES</span>
            <h2 className="text-[26px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>Not just answers. Documents you can use.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3 md:max-w-[580px] md:mx-auto" style={{ lineHeight: 1.55 }}>
              Yulia doesn&apos;t just tell you things &mdash; she generates the same institutional-grade documents that advisory firms produce. Formatted. Sourced. Ready for lenders, buyers, attorneys, and closing tables.
            </p>
          </div>
          {/* Mobile: list */}
          <div className="md:hidden">
            {[
              { icon: '\uD83D\uDCCA', title: 'Valuation Reports', body: 'YOUR number \u2014 defended with comparable transactions, industry benchmarks, and local market data. Built to withstand scrutiny from buyers, lenders, and attorneys.' },
              { icon: '\uD83D\uDCC4', title: 'Confidential Information Memos', body: 'The document that presents YOUR business to qualified buyers. 25+ pages. Professional. Data-backed. The document that starts your deal.' },
              { icon: '\uD83C\uDFE6', title: 'Financing Models', body: 'YOUR deal modeled against live SBA rates. Down payment. Monthly payment. DSCR. Cash-on-cash returns. Know if it\u2019s bankable before you commit.' },
              { icon: '\uD83D\uDDFA\uFE0F', title: 'Market Intelligence', body: 'YOUR competitive landscape. YOUR metro. YOUR industry. Competitor counts, wage benchmarks, PE activity, transaction multiples \u2014 localized, not national.' },
              { icon: '\uD83C\uDFD7\uFE0F', title: 'Deal Structure Analysis', body: 'YOUR options. Asset vs stock. Financing scenarios. Earnout modeling. Working capital targets. The structure that maximizes YOUR outcome.' },
              { icon: '\uD83D\uDD12', title: 'Deal Room', body: 'YOUR workspace. Attorneys, CPAs, brokers, buyers \u2014 everyone in one place. Role-based access. Version history. Nothing lost.' },
            ].map((d, i) => (
              <div key={d.title} className={`py-4 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[18px]">{d.icon}</span>
                  <h3 className="text-[16px] font-bold text-[#1A1A18] m-0">{d.title}</h3>
                </div>
                <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{d.body}</p>
              </div>
            ))}
          </div>
          {/* Desktop: 2x3 grid */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { icon: '\uD83D\uDCCA', title: 'Valuation Reports', body: 'YOUR number \u2014 defended with comparable transactions, industry benchmarks, and local market data. Built to withstand scrutiny from buyers, lenders, and attorneys.' },
              { icon: '\uD83D\uDCC4', title: 'Confidential Information Memos', body: 'The document that presents YOUR business to qualified buyers. 25+ pages. Professional. Data-backed. The document that starts your deal.' },
              { icon: '\uD83C\uDFE6', title: 'Financing Models', body: 'YOUR deal modeled against live SBA rates. Down payment. Monthly payment. DSCR. Cash-on-cash returns. Know if it\u2019s bankable before you commit.' },
              { icon: '\uD83D\uDDFA\uFE0F', title: 'Market Intelligence', body: 'YOUR competitive landscape. YOUR metro. YOUR industry. Competitor counts, wage benchmarks, PE activity, transaction multiples \u2014 localized, not national.' },
              { icon: '\uD83C\uDFD7\uFE0F', title: 'Deal Structure Analysis', body: 'YOUR options. Asset vs stock. Financing scenarios. Earnout modeling. Working capital targets. The structure that maximizes YOUR outcome.' },
              { icon: '\uD83D\uDD12', title: 'Deal Room', body: 'YOUR workspace. Attorneys, CPAs, brokers, buyers \u2014 everyone in one place. Role-based access. Version history. Nothing lost.' },
            ].map(d => (
              <div key={d.title} className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-6">
                <span className="text-[24px] block mb-2">{d.icon}</span>
                <h3 className="text-[16px] font-bold mb-2">{d.title}</h3>
                <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 5: WHO THIS IS FOR ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <h2 className="text-[26px] md:text-[36px] font-extrabold mb-5 md:mb-8 md:text-center" style={{ letterSpacing: '-0.025em' }}>Whatever side of the deal you&apos;re on.</h2>
          {/* Mobile: divider list */}
          <div className="md:hidden">
            {[
              { label: 'SELLING YOUR BUSINESS', body: "You\u2019ve built something valuable. Now you need to know what it\u2019s worth, how to get the most for it, and how to navigate a process that can take 6\u201324 months.\n\nYulia handles the analysis. You make the decisions.\n\nFull sale. Partner buyout. Capital raise. Employee transition. Whatever your exit looks like \u2014 Yulia builds the intelligence and walks you through every step.", link: 'See the seller journey \u2192' },
              { label: 'BUYING A BUSINESS', body: "You\u2019ve found a deal \u2014 or you\u2019re looking for one. Either way, you need to know: is this worth my time and money?\n\nYulia evaluates every opportunity against real data and gets you to \u201Cpursue\u201D or \u201Cpass\u201D in minutes instead of months. Then she stays with you through negotiation, close, and 180 days of post-acquisition value creation.", link: 'See the buyer journey \u2192' },
              { label: 'ADVISING ON DEALS', body: "You close deals. That\u2019s your superpower. But the data assembly, financial modeling, and document production eat your week.\n\nYulia does that work in minutes. White-label everything. Take on more clients. Close more deals.", link: 'See advisor tools \u2192' },
            ].map((a, i) => (
              <div key={a.label} className={`py-4 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#D4714E] mb-1.5 block">{a.label}</span>
                <p className="text-[14px] text-[#6E6A63] m-0 whitespace-pre-line mb-2" style={{ lineHeight: 1.55 }}>{a.body}</p>
                <span className="text-[13px] font-bold text-[#D4714E]">{a.link}</span>
              </div>
            ))}
          </div>
          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {[
              { label: 'SELLING YOUR BUSINESS', body: "You\u2019ve built something valuable. Now you need to know what it\u2019s worth and how to navigate a process that can take 6\u201324 months. Full sale. Partner buyout. Capital raise. Employee transition \u2014 Yulia handles the analysis. You make the decisions.", link: 'See the seller journey \u2192' },
              { label: 'BUYING A BUSINESS', body: "You\u2019ve found a deal \u2014 or you\u2019re looking for one. Yulia evaluates every opportunity against real data and gets you to \u201Cpursue\u201D or \u201Cpass\u201D in minutes. Then she stays with you through close and 180 days of value creation.", link: 'See the buyer journey \u2192' },
              { label: 'ADVISING ON DEALS', body: "You close deals. That\u2019s your superpower. But data assembly, financial modeling, and document production eat your week. Yulia does that work in minutes. White-label everything. Take on more clients. Close more deals.", link: 'See advisor tools \u2192' },
            ].map(a => (
              <div key={a.label} className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-6">
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#D4714E] mb-1 block">{a.label}</span>
                <p className="text-[15px] text-[#6E6A63] m-0 mb-3" style={{ lineHeight: 1.55 }}>{a.body}</p>
                <span className="text-[13px] font-bold text-[#D4714E]">{a.link}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 6: THE ENGINE ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">HOW IT WORKS</span>
            <h2 className="text-[26px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>Seven layers of intelligence. Every deal.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3 md:max-w-[640px] md:mx-auto" style={{ lineHeight: 1.55 }}>
              Every deal runs through the smbX.ai Engine &mdash; a structured methodology that analyzes your business across seven dimensions. Built on live data from the U.S. Census Bureau, Bureau of Labor Statistics, Federal Reserve, SEC, SBA, and IRS.
            </p>
          </div>
          {/* Source pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['U.S. Census', 'BLS', 'Federal Reserve', 'SEC EDGAR', 'SBA', 'IRS SOI'].map(s => (
              <span key={s} className="text-[12px] font-bold text-[#6E6A63] bg-[#F7F7F7] border border-[#E5E5E5] rounded-full px-3 py-1">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 7: PRICING PREVIEW ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[640px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <h2 className="text-[24px] md:text-[36px] font-extrabold" style={{ letterSpacing: '-0.025em' }}>Free to start. Pay when your deal is ready.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3" style={{ lineHeight: 1.55 }}>
              Conversation with Yulia: always free. Classification, preliminary valuation, market overview, process guidance: always free.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Market Intelligence', price: '$200' },
              { title: 'Valuation', price: '$350' },
              { title: 'CIM', price: '$700' },
            ].map(item => (
              <div key={item.title} className="flex items-center justify-between bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl px-5 py-3.5">
                <span className="text-[15px] font-bold text-[#1A1A18]">{item.title}</span>
                <span className="text-[18px] font-black text-[#D4714E] shrink-0 ml-4">{item.price}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onChipClick("What can I do for free?")}
            className="text-[14px] font-bold text-[#D4714E] mt-4 bg-transparent border-none cursor-pointer p-0 hover:underline"
            style={{ fontFamily: 'inherit' }}
            type="button"
          >
            See full pricing &rarr;
          </button>
        </div>
      </section>

      {/* ═══ Section 8: CLOSE ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-10 pb-10 md:pt-20 md:pb-20 md:px-8">
        <div className="md:max-w-[600px] md:mx-auto md:text-center">
          <h2 className="text-[28px] md:text-[42px] font-extrabold" style={{ letterSpacing: '-0.03em' }}>Your deal. Your pace. Start now.</h2>
          <p className="text-[16px] md:text-[18px] text-[#6E6A63] mt-3">No signup. No credit card. Just start talking.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F7F7F7] py-6 md:py-8 text-center">
        <span className="text-[18px] font-extrabold">smb<span className="text-[#D4714E]">X</span>.ai</span>
        <p className="text-[12px] font-medium text-[#A8A49C] mt-1 m-0">Deal Intelligence Infrastructure</p>
      </footer>
    </>
  );
}
