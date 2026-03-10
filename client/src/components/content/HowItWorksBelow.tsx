interface HowItWorksBelowProps {
  onChipClick: (text: string) => void;
}

export default function HowItWorksBelow({ onChipClick }: HowItWorksBelowProps) {
  return (
    <div>
      {/* ═══ Section 1: THE INFORMATION DESERT [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            Between $300K and $50M, nobody has good data.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">The largest institutions have Bloomberg, PitchBook, and armies of analysts. Fortune 500 deals have investment banks with $100M budgets.</p>
            <p className="m-0">Business owners selling a $3M company have Google and gut instinct. Brokers managing 15 listings pull comps from memory. Buyers evaluating a listing check the asking price against... what, exactly?</p>
            <p className="m-0">The data exists. It&apos;s in Census records, BLS reports, FRED economic series, SBA lending databases, SEC filings. But nobody has synthesized it into intelligence that&apos;s useful for making deal decisions.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Until now.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: SOVEREIGN DATA ENGINE ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-4">
            Every number is sourced. Every insight is traceable.
          </h2>
          <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            This isn&apos;t AI-generated estimates. This is federal data that agencies are required by law to collect:
          </p>

          <div className="space-y-5">
            {[
              { label: 'U.S. CENSUS BUREAU', body: 'Business counts by industry, geography, and size class. When Yulia says \u201cthere are 847 HVAC businesses in Dallas-Fort Worth,\u201d that\u2019s a Census number.' },
              { label: 'BUREAU OF LABOR STATISTICS', body: 'Wage benchmarks, employment trends, occupational data by region. When Yulia benchmarks your labor costs, she\u2019s using BLS data for your specific MSA.' },
              { label: 'FEDERAL RESERVE (FRED)', body: 'Interest rates, economic indicators, lending conditions. When Yulia models SBA financing, she\u2019s using live Fed rates \u2014 not last quarter\u2019s.' },
              { label: 'SEC EDGAR', body: 'Public company filings, comparable transactions, institutional activity. When Yulia identifies PE consolidation in your sector, she\u2019s tracking real filings.' },
              { label: 'SBA LENDER ACTIVITY REPORTS', body: 'Loan approval rates, average deal sizes, lender preferences by region. When Yulia says a deal is \u201cSBA-bankable,\u201d she\u2019s checked the actual lending patterns.' },
            ].map(item => (
              <div key={item.label} style={{ background: '#F7F6F4', borderRadius: 20, border: '1px solid rgba(26,26,24,0.05)', padding: '24px 28px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#D4714E', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.label}</h3>
                <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>

          <p className="max-w-3xl mt-10" style={{ fontSize: '17px', fontWeight: 500, color: '#1A1A18', lineHeight: 1.65 }}>
            The difference between asking ChatGPT about your business and asking Yulia is the difference between reading a Wikipedia article about surgery and consulting a specialist with your chart in front of them.
          </p>
        </div>
      </section>

      {/* ═══ Section 3: SEVEN LAYERS OF INTELLIGENCE ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px]">
              Not a checklist. A methodology.
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginTop: 16, lineHeight: 1.65 }} className="max-w-3xl md:mx-auto">
              Every deal Yulia touches is analyzed through seven dimensions &mdash; each one drawing from different data sources, each one revealing something the others miss.
            </p>
          </div>

          <div className="space-y-10 md:space-y-12">
            {[
              { layer: 'LAYER 1 \u2014 INDUSTRY STRUCTURE', body: 'Competitive density. Fragmentation vs. consolidation. NAICS-level benchmarking. Who\u2019s in your market and how your business compares.' },
              { layer: 'LAYER 2 \u2014 REGIONAL ECONOMICS', body: 'MSA-level wage data. Cost of living. Business formation rates. Demographic trends. The local reality that national averages completely miss.' },
              { layer: 'LAYER 3 \u2014 FINANCIAL NORMALIZATION', body: 'SDE or EBITDA calculation. Add-back discovery. Trend analysis. Margin benchmarking against industry medians. The forensic work that separates real value from reported numbers.' },
              { layer: 'LAYER 4 \u2014 BUYER LANDSCAPE', body: 'Who\u2019s buying in this space right now? PE platforms, strategic acquirers, SBA-qualified individuals, search funds. Mapped to your specific sector and geography.' },
              { layer: 'LAYER 5 \u2014 DEAL ARCHITECTURE', body: 'Structure optimization. Financing modeling. Earnout design. Working capital adjustment. The engineering of how the deal actually gets done.' },
              { layer: 'LAYER 6 \u2014 RISK ASSESSMENT', body: 'Customer concentration. Owner dependency. Key person risk. Regulatory exposure. Revenue sustainability. Every risk identified before it becomes a surprise in diligence.' },
              { layer: 'LAYER 7 \u2014 FORWARD SIGNALS', body: 'Industry growth projections. Wage inflation impact. Regulatory changes on the horizon. Technology disruption indicators. Where the market is going, not just where it\u2019s been.' },
            ].map(item => (
              <div key={item.layer}>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>{item.layer}</span>
                <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '12px 0 0', lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 4: LEAGUE-ADAPTIVE INTELLIGENCE [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            A $400K landscaping company and a $40M manufacturing platform are fundamentally different deals.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Yulia doesn&apos;t give the same advice to every business. She classifies your deal by complexity and adapts everything &mdash; her vocabulary, methodology, financial metrics, deliverable depth, and the questions she asks.</p>
            <p className="m-0">An owner-operated pest control company gets SDE-based coaching, step-by-step guidance, and SBA-focused analysis.</p>
            <p className="m-0">A $20M EBITDA manufacturing platform gets institutional metrics, arbitrage modeling, covenant analysis, and board-level deliverables.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Same methodology. Same data sources. Same rigor. Calibrated to the deal in front of you.</p>
            <p className="m-0">That&apos;s why the platform serves every deal size &mdash; from $300K to $300M. Not because it&apos;s generic. Because it adapts.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 5: LOCALIZED INTELLIGENCE ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            National averages are noise. Your market is signal.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">A plumbing company in Phoenix and a plumbing company in rural Pennsylvania are fundamentally different deals. Different competitive density. Different wage structures. Different buyer pools. Different SBA lending patterns. Different growth trajectories.</p>
            <p className="m-0">Yulia delivers intelligence specific to your MSA &mdash; not your state, not your region, your metropolitan statistical area. The same geographic precision that institutional investors use, available to every dealmaker.</p>
            <p className="m-0">When Yulia tells you there are 14 active PE platforms acquiring HVAC companies in Texas, she&apos;s not estimating. When she says your EBITDA margin of 18.6% is below the 21% industry median for your MSA, she&apos;s not guessing. When she models SBA financing at today&apos;s rate with your regional lender&apos;s average approval metrics, she&apos;s not approximating.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Every number. Sourced. Traceable. Defensible.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 6: CONVERSATION PREVIEW ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            This took 47 seconds.
          </h2>

          {/* Conversation preview card */}
          <div className="max-w-3xl mb-10" style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '28px 32px' }}>
            <div className="space-y-6">
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(26,26,24,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>USER</span>
                <p style={{ fontSize: '15px', color: '#1A1A18', margin: '6px 0 0', lineHeight: 1.6 }}>I own an HVAC company in DFW, about $4.2M revenue. Thinking about selling.</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#D4714E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>YULIA</span>
                <div className="mt-1.5 space-y-3" style={{ fontSize: '15px', color: 'rgba(26,26,24,0.65)', lineHeight: 1.6 }}>
                  <p className="m-0">Commercial HVAC in Dallas-Fort Worth &mdash; I know this market well.</p>
                  <p className="m-0">At $4.2M revenue, I&apos;m classifying you at L3. That means we use EBITDA, not SDE, and your multiple range is 4.8&times;&ndash;6.2&times;. Preliminary EBITDA range: $630K&ndash;$780K. That puts your enterprise value at <strong>$3.74M&ndash;$4.84M</strong> depending on margins and add-backs.</p>
                  <p className="m-0">Here&apos;s what&apos;s interesting: Census data shows 847 HVAC businesses in DFW, but only 12% are commercial-focused with $3M+ revenue. You&apos;re not average. I&apos;m also tracking 14 active PE platforms acquiring HVAC in Texas &mdash; that&apos;s driving multiples up.</p>
                  <p className="m-0">Your current EBITDA margin of ~18.6% is below the 21% industry median. There&apos;s an optimization opportunity that could add $100K+ to your adjusted EBITDA before we go to market.</p>
                  <p className="m-0" style={{ color: '#1A1A18', fontWeight: 500 }}>What&apos;s your total owner compensation &mdash; salary, benefits, and any personal expenses running through the business?</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">That&apos;s deal intelligence for a real business, in a real market, with real federal data &mdash; in under a minute.</p>
            <p className="m-0">Not a template. Not a generic report. Analysis specific to your industry, your geography, your financials, and your deal complexity.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s what a single conversation with Yulia produces. Imagine what happens over 6 months.</p>
          </div>

          <div className="mt-10">
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about your deal and watch the intelligence unfold.</p>
            <button
              onClick={() => onChipClick("Tell me about your deal intelligence")}
              style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              type="button"
            >
              Start a conversation &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
