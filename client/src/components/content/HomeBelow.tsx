interface HomeBelowProps {
  onChipClick: (text: string) => void;
}

export default function HomeBelow({ onChipClick }: HomeBelowProps) {
  return (
    <>
      {/* ═══ Section 1: THE PROBLEM ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7]" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">THE REALITY</span>
            <h2 className="text-[24px] md:text-[36px] font-extrabold mt-2 md:max-w-[720px] md:mx-auto" style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Buying or selling a business is one of the most complex financial decisions you&apos;ll ever make.
            </h2>
          </div>
          <div className="md:max-w-[680px] md:mx-auto space-y-5">
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              And for most people, it starts with a Google search and ends with a spreadsheet that might be wrong.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              The information you need exists &mdash; buried in Census records, BLS wage data, SBA lending reports, SEC filings, and thousands of comparable transactions. But assembling it takes weeks. Interpreting it takes expertise. And getting it wrong costs real money.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              A seller who misses $200K in add-backs leaves $200K on the table. A buyer who doesn&apos;t model DSCR correctly gets rejected by the lender. An advisor who spends 40 hours on a $1.2M deal can&apos;t afford to take the next one.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#1A1A18] font-bold m-0" style={{ lineHeight: 1.65 }}>
              That&apos;s what Yulia fixes.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: HOW IT WORKS ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">HOW IT WORKS</span>
            <h2 className="text-[26px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>Five minutes. Five answers.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3 md:max-w-[580px] md:mx-auto" style={{ lineHeight: 1.55 }}>
              Tell Yulia your industry, your location, and your numbers. Here&apos;s what happens next.
            </p>
          </div>
          {/* Mobile: clean list */}
          <div className="md:hidden">
            {[
              { n: '01', title: 'She classifies your deal.', body: 'Every business is different. A $400K landscaping company and a $40M manufacturing platform require completely different financial frameworks. Yulia determines yours instantly \u2014 SDE or EBITDA, SBA or conventional, owner-operator or institutional \u2014 so everything that follows is calibrated to YOUR deal.' },
              { n: '02', title: 'She finds money you didn\u2019t know you had.', body: 'Tax returns are designed to minimize taxes, not maximize sale price. That means legitimate business expenses \u2014 your personal vehicle, family cell phones, one-time legal fees, above-market rent to your own LLC \u2014 are hiding your true earnings. Most owners miss $100K\u2013$500K in add-backs. Yulia finds them line by line.' },
              { n: '03', title: 'She maps your competitive landscape.', body: 'How many businesses like yours operate in your metro? What are they selling for? Which PE firms are actively acquiring in your sector? Yulia pulls live federal data specific to your geography \u2014 not national averages, YOUR market.' },
              { n: '04', title: 'She gives you a number you can defend.', body: 'Not a Zillow-style estimate. A multi-methodology valuation built on real comparable transactions, calibrated industry multiples, and local market conditions. The kind of number that holds up at the closing table.' },
              { n: '05', title: 'She tells you what to do next.', body: 'Should you optimize EBITDA before listing? Is your business SBA-financeable at the asking price? Do you need a broker? Yulia maps a path forward based on your specific deal, your timeline, and your goals.' },
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
                { n: '01', title: 'She classifies your deal.', body: 'A $400K landscaping company and a $40M manufacturing platform require completely different frameworks. Yulia determines yours instantly \u2014 SDE or EBITDA, SBA or conventional, owner-operator or institutional.' },
                { n: '02', title: 'She finds hidden value.', body: 'Tax returns minimize taxes, not sale price. Your personal vehicle, family phones, one-time legal fees \u2014 all legitimate add-backs. Most owners miss $100K\u2013$500K. Yulia finds them line by line.' },
                { n: '03', title: 'She maps your market.', body: 'Competitor counts from Census. Wage data from BLS. PE activity in your sector. All localized to your metro \u2014 not national averages.' },
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
                { n: '04', title: 'She gives you a defensible number.', body: 'Multi-methodology valuation built on real comparable transactions, calibrated industry multiples, and local market conditions. The kind of number that holds up at the closing table.' },
                { n: '05', title: 'She tells you what to do next.', body: 'Optimize before listing? Find SBA buyers? Engage an advisor? A path forward based on your specific deal, timeline, and goals. Not generic advice \u2014 YOUR next move.' },
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
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">LIVE EXAMPLE</span>
            <h2 className="text-[24px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>See Yulia work a real deal.</h2>
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

          {/* Timing callout */}
          <p className="text-[13px] md:text-[14px] font-semibold text-[#6E6A63] mt-5 md:text-center">
            This took Yulia 47 seconds. It would take a human team 2&ndash;3 weeks.
          </p>
        </div>
      </section>

      {/* ═══ Section 4: DELIVERABLES ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">DELIVERABLES</span>
            <h2 className="text-[26px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>Not conversation. Documents.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3 md:max-w-[580px] md:mx-auto" style={{ lineHeight: 1.55 }}>
              When your deal is ready, Yulia generates the same institutional-grade deliverables that advisory firms produce &mdash; formatted, sourced, and ready for the closing table.
            </p>
          </div>
          {/* Mobile: list */}
          <div className="md:hidden">
            {[
              { icon: '\uD83D\uDCCA', title: 'Valuation Report', body: 'A multi-methodology analysis with comparable transactions, industry benchmarks, and local market context. Defensible enough for lenders, detailed enough for attorneys, clear enough for you.' },
              { icon: '\uD83C\uDFE2', title: 'Market Intelligence Report', body: 'Competitive density. Regional economics. PE consolidation activity. Industry multiples. SBA lending volume. Everything about your market \u2014 localized to your MSA.' },
              { icon: '\uD83D\uDCC4', title: 'Confidential Information Memo', body: 'The 25+ page document that presents your business to qualified buyers. Professionally formatted, data-backed, and ready to distribute.' },
              { icon: '\uD83C\uDFE6', title: 'SBA Financing Model', body: 'Debt service coverage ratios. Sources & uses tables. Cash-on-cash returns. Down payment calculations. All modeled against live federal interest rates.' },
              { icon: '\uD83C\uDFAF', title: 'Buyer Matching', body: 'Your business matched against active buyer profiles \u2014 PE firms, search funds, SBA buyers, and strategic acquirers \u2014 filtered by industry, geography, and financial fit.' },
              { icon: '\uD83D\uDD12', title: 'Deal Room', body: 'One secure workspace where your attorney, CPA, broker, and prospective buyers can review everything. Role-based access. Version history. Nothing falls through the cracks.' },
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
              { icon: '\uD83D\uDCCA', title: 'Valuation Report', body: 'A multi-methodology analysis with comparable transactions, industry benchmarks, and local market context. Defensible enough for lenders, detailed enough for attorneys, clear enough for you.' },
              { icon: '\uD83C\uDFE2', title: 'Market Intelligence Report', body: 'Competitive density. Regional economics. PE consolidation activity. Industry multiples. SBA lending volume. Everything about your market \u2014 localized to your MSA.' },
              { icon: '\uD83D\uDCC4', title: 'Confidential Information Memo', body: 'The 25+ page document that presents your business to qualified buyers. Professionally formatted, data-backed, and ready to distribute.' },
              { icon: '\uD83C\uDFE6', title: 'SBA Financing Model', body: 'Debt service coverage ratios. Sources & uses tables. Cash-on-cash returns. Down payment calculations. All modeled against live federal interest rates.' },
              { icon: '\uD83C\uDFAF', title: 'Buyer Matching', body: 'Your business matched against active buyer profiles \u2014 PE firms, search funds, SBA buyers, and strategic acquirers \u2014 filtered by industry, geography, and financial fit.' },
              { icon: '\uD83D\uDD12', title: 'Deal Room', body: 'One secure workspace where your attorney, CPA, broker, and prospective buyers can review everything. Role-based access. Version history. Nothing falls through the cracks.' },
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

      {/* ═══ Section 5: AUDIENCE ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <h2 className="text-[26px] md:text-[36px] font-extrabold mb-5 md:mb-8 md:text-center" style={{ letterSpacing: '-0.025em' }}>Built for everyone in the deal.</h2>
          {/* Mobile: divider list */}
          <div className="md:hidden">
            {[
              { label: 'SELLING', quote: "I\u2019m selling my business.", body: "This is probably the biggest financial decision you\u2019ll ever make \u2014 and the stakes are personal. Your life\u2019s work. Your employees. Your legacy.\n\nYulia makes sure you don\u2019t leave money on the table. She finds every add-back, calculates your true adjusted earnings, benchmarks your margins against the industry, and generates a valuation you can defend at the closing table.\n\nWhether your business does $500K or $50M in revenue. Whether you have a broker or you\u2019re exploring on your own." },
              { label: 'BUYING', quote: "I\u2019m buying a business.", body: "You\u2019ve found a listing. The asking price is $2.1M. The broker says it\u2019s a \u201Cgreat deal.\u201D But is it?\n\nYulia models SBA financing against live federal rates, runs debt service coverage ratios, analyzes the competitive landscape, and tells you whether the asking price is justified \u2014 before you invest a dime in due diligence.\n\nFrom your first acquisition to your twentieth." },
              { label: 'ADVISING', quote: "I\u2019m a broker or advisor.", body: "You know how to close. You know how to negotiate. What you don\u2019t have is infinite hours.\n\nYulia handles the data assembly, financial modeling, CIM formatting, and buyer pre-qualification in minutes. White-label everything under your brand. The deals you used to turn away? They\u2019re profitable now." },
              { label: 'INVESTING', quote: "I\u2019m a search fund or PE firm.", body: "Your deal team is talented. They\u2019re also expensive. Yulia sources targets against your acquisition criteria, screens markets by fragmentation, models financing scenarios, and delivers deal-ready intelligence packages.\n\nThe 40-hour analysis? Ready in minutes." },
            ].map((a, i) => (
              <div key={a.label} className={`py-4 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#D4714E] mb-1.5 block">{a.label}</span>
                <h3 className="text-[18px] font-bold text-[#1A1A18] mb-1.5">{a.quote}</h3>
                <p className="text-[14px] text-[#6E6A63] m-0 whitespace-pre-line" style={{ lineHeight: 1.55 }}>{a.body}</p>
              </div>
            ))}
          </div>
          {/* Desktop: 2x2 card grid */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { label: 'SELLING', quote: "I\u2019m selling my business.", body: "This is probably the biggest financial decision you\u2019ll ever make. Yulia finds every add-back, calculates your true adjusted earnings, benchmarks your margins, and generates a valuation you can defend at the closing table. Whether your business does $500K or $50M in revenue." },
              { label: 'BUYING', quote: "I\u2019m buying a business.", body: "You\u2019ve found a listing. The asking price is $2.1M. But is it justified? Yulia models SBA financing against live federal rates, runs DSCR, analyzes the competitive landscape, and tells you before you invest a dime in due diligence." },
              { label: 'ADVISING', quote: "I\u2019m a broker or advisor.", body: "You know how to close. What you don\u2019t have is infinite hours. Yulia handles data assembly, financial modeling, CIM formatting, and buyer pre-qualification in minutes. White-label everything under your brand." },
              { label: 'INVESTING', quote: "I\u2019m a search fund or PE firm.", body: "Your deal team is talented. They\u2019re also expensive. Yulia sources targets against your criteria, screens markets by fragmentation, models financing, and delivers deal-ready intelligence. The 40-hour analysis? Ready in minutes." },
            ].map(a => (
              <div key={a.label} className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-6">
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#D4714E] mb-1 block">{a.label}</span>
                <h3 className="text-[20px] font-bold mb-2">{a.quote}</h3>
                <p className="text-[15px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{a.body}</p>
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
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">THE METHODOLOGY</span>
            <h2 className="text-[26px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>Seven layers deep. Every deal.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3 md:max-w-[640px] md:mx-auto" style={{ lineHeight: 1.55 }}>
              Every deal Yulia touches runs through the smbX.ai Engine &mdash; a seven-layer intelligence methodology built on live U.S. federal data. Not a chatbot with a prompt. A structured analytical framework.
            </p>
          </div>
          {/* Mobile: list */}
          <div className="md:hidden">
            {[
              { n: '1', title: 'Industry Structure', body: 'NAICS classification. Standard financial metrics. Typical value drivers. Known risk factors.' },
              { n: '2', title: 'Regional Economics', body: 'Competitive density from Census. Wage benchmarks from BLS. Employment trends. Cost of living. Your specific MSA.' },
              { n: '3', title: 'Financial Normalization', body: 'SDE for owner-operators. EBITDA for institutional deals. Add-back identification. Margin benchmarking. Multi-year trends.' },
              { n: '4', title: 'Buyer Landscape', body: 'Individual SBA buyers? PE roll-up platforms? Strategic acquirers? Search fund operators? Yulia maps the buyer universe.' },
              { n: '5', title: 'Deal Architecture', body: 'Asset vs stock sale. SBA vs conventional vs seller financing. Earnout modeling. Working capital targets. Sources & uses.' },
              { n: '6', title: 'Risk Assessment', body: 'Customer concentration. Owner dependency. Key person risk. Regulatory exposure. Declining revenue trends.' },
              { n: '7', title: 'Forward Signals', body: 'Industry consolidation trends. PE appetite. Regulatory changes. Demand signals. Factors that move your multiple over 12\u201324 months.' },
            ].map((layer, i) => (
              <div key={layer.n} className={`flex gap-3.5 py-4 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <span className="text-[24px] font-extrabold text-[#D4714E] opacity-70 min-w-[24px] leading-none">{layer.n}</span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1A1A18] mb-1">{layer.title}</h3>
                  <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{layer.body}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: card grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-4">
              {[
                { n: '1', title: 'Industry Structure', body: 'NAICS classification. Standard financial metrics. Typical value drivers. Known risk factors.' },
                { n: '2', title: 'Regional Economics', body: 'Competitive density from Census. Wage benchmarks from BLS. Employment trends. Your specific MSA.' },
                { n: '3', title: 'Financial Normalization', body: 'SDE for owner-operators. EBITDA for institutional deals. Add-back identification. Margin benchmarking.' },
              ].map(layer => (
                <div key={layer.n} className="bg-white border border-[#E5E5E5] rounded-2xl p-6">
                  <span className="text-[28px] font-extrabold text-[#D4714E] opacity-70 leading-none block mb-2">Layer {layer.n}</span>
                  <h3 className="text-[16px] font-bold mb-2">{layer.title}</h3>
                  <p className="text-[14px] text-[#6E6A63] m-0">{layer.body}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              {[
                { n: '4', title: 'Buyer Landscape', body: 'SBA buyers, PE roll-ups, strategic acquirers, search funds.' },
                { n: '5', title: 'Deal Architecture', body: 'Asset vs stock. SBA vs conventional. Earnout modeling.' },
                { n: '6', title: 'Risk Assessment', body: 'Customer concentration. Owner dependency. Regulatory exposure.' },
                { n: '7', title: 'Forward Signals', body: 'Consolidation trends. PE appetite. Regulatory changes.' },
              ].map(layer => (
                <div key={layer.n} className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
                  <span className="text-[24px] font-extrabold text-[#D4714E] opacity-70 leading-none block mb-2">{layer.n}</span>
                  <h3 className="text-[14px] font-bold mb-1">{layer.title}</h3>
                  <p className="text-[13px] text-[#6E6A63] m-0">{layer.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 7: DATA SOURCES ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <h2 className="text-[22px] md:text-[36px] font-extrabold" style={{ letterSpacing: '-0.025em' }}>Every number is sourced. Every source is sovereign.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3 md:max-w-[640px] md:mx-auto" style={{ lineHeight: 1.55 }}>
              Built on data from U.S. federal agencies required by law to collect it. The same data that informs the Federal Reserve and Wall Street. Not scraped. Not estimated. Recorded.
            </p>
          </div>
          {/* Mobile: list */}
          <div className="md:hidden">
            {[
              { name: 'U.S. Census Bureau', detail: 'County Business Patterns \u2014 exact business counts by NAICS code and geography.' },
              { name: 'Bureau of Labor Statistics', detail: 'QCEW \u2014 quarterly wage and employment data by industry and county.' },
              { name: 'Federal Reserve (FRED)', detail: 'Interest rates, economic indicators, lending conditions.' },
              { name: 'SEC EDGAR', detail: 'Public company filings, M&A transaction data, industry benchmarks.' },
              { name: 'SBA Lender Reports', detail: '7(a) and 504 loan volumes by lender, state, and industry.' },
              { name: 'IRS Statistics of Income', detail: 'Industry-wide financial benchmarks from tax return data.' },
            ].map((s, i) => (
              <div key={s.name} className={`py-3.5 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <h4 className="text-[15px] font-bold text-[#1A1A18] m-0 mb-0.5">{s.name}</h4>
                <p className="text-[13px] text-[#6E6A63] m-0">{s.detail}</p>
              </div>
            ))}
          </div>
          {/* Desktop: 3x2 grid */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {[
              { name: 'U.S. Census Bureau', detail: 'County Business Patterns \u2014 exact business counts by NAICS code and geography. Updated annually.' },
              { name: 'Bureau of Labor Statistics', detail: 'QCEW \u2014 quarterly wage and employment data by industry and county.' },
              { name: 'Federal Reserve (FRED)', detail: 'Interest rates, economic indicators, lending conditions.' },
              { name: 'SEC EDGAR', detail: 'Public company filings, M&A transaction data, industry benchmarks.' },
              { name: 'SBA Lender Reports', detail: '7(a) and 504 loan volumes by lender, state, and industry.' },
              { name: 'IRS Statistics of Income', detail: 'Industry-wide financial benchmarks from tax return data.' },
            ].map(s => (
              <div key={s.name} className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-5">
                <h4 className="text-[14px] font-bold text-[#1A1A18] m-0 mb-1">{s.name}</h4>
                <p className="text-[13px] text-[#6E6A63] m-0">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 8: PRICING PREVIEW ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[640px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <h2 className="text-[24px] md:text-[36px] font-extrabold" style={{ letterSpacing: '-0.025em' }}>Free to start. Pay when you&apos;re ready.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3" style={{ lineHeight: 1.55 }}>
              Talk to Yulia for free. Get your deal classified, your preliminary valuation range, and your market overview &mdash; no account, no credit card, no catch.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Market Intelligence Report', price: '$200' },
              { title: 'Full Valuation Analysis', price: '$350' },
              { title: 'Confidential Information Memo', price: '$700' },
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

      {/* ═══ Section 9: CLOSING CTA ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-10 pb-10 md:pt-20 md:pb-20 md:px-8">
        <div className="md:max-w-[600px] md:mx-auto md:text-center">
          <h2 className="text-[28px] md:text-[42px] font-extrabold" style={{ letterSpacing: '-0.03em' }}>Your deal is waiting.</h2>
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
