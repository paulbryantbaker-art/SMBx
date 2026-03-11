import {
  ScrollReveal,
  StatBar,
  AnimatedTimeline,
  MagneticButton,
  AnimatedCounter,
  ZigZagSection,
  BentoGrid,
  PullQuote,
  FullBleedSection,
} from './animations';

interface HowItWorksBelowProps {
  onChipClick: (text: string) => void;
}

export default function HowItWorksBelow({ onChipClick }: HowItWorksBelowProps) {
  return (
    <div>
      {/* ═══ Block 1 — The problem [FullBleed tinted + PullQuote] ═══ */}
      <FullBleedSection tinted className="mt-20">
        <ScrollReveal>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>THE PROBLEM</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            Between $300K and $50M, nobody has good data.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">The largest institutions have Bloomberg, PitchBook, and armies of analysts. Fortune 500 deals have investment banks with $100M budgets.</p>
            <p className="m-0">Business owners selling a $3M company have Google and gut instinct. Brokers managing 15 listings pull comps from memory. Buyers evaluating a listing check the asking price against... what, exactly?</p>
            <p className="m-0">The data exists. It&apos;s in Census records, BLS reports, FRED economic series, SBA lending databases, SEC filings. But nobody has synthesized it into intelligence that&apos;s useful for making deal decisions.</p>
          </div>
        </ScrollReveal>
        <PullQuote text="Until now." />
      </FullBleedSection>

      {/* ═══ Block 2 — Sovereign data engine [ZigZag] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>SOVEREIGN DATA ENGINE</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
              Every number is sourced. Every insight is traceable.
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              This isn&apos;t AI-generated estimates. This is federal data that agencies are required by law to collect:
            </p>
          </ScrollReveal>

          <ZigZagSection items={[
            { icon: '\uD83D\uDCCA', title: 'U.S. Census Bureau', body: 'Business counts by industry, geography, and size class. When Yulia says \u201Cthere are 847 HVAC businesses in Dallas-Fort Worth,\u201D that\u2019s a Census number.' },
            { icon: '\uD83D\uDCC8', title: 'Bureau of Labor Statistics', body: 'Wage benchmarks, employment trends, occupational data by region. When Yulia benchmarks your labor costs, she\u2019s using BLS data for your specific MSA.' },
            { icon: '\uD83C\uDFE6', title: 'Federal Reserve (FRED)', body: 'Interest rates, economic indicators, lending conditions. When Yulia models SBA financing, she\u2019s using live Fed rates \u2014 not last quarter\u2019s.' },
            { icon: '\uD83D\uDCCB', title: 'SEC EDGAR', body: 'Public company filings, comparable transactions, institutional activity. When Yulia identifies PE consolidation in your sector, she\u2019s tracking real filings.' },
            { icon: '\uD83D\uDD12', title: 'SBA Lender Activity Reports', body: 'Loan approval rates, average deal sizes, lender preferences by region. When Yulia says a deal is \u201CSBA-bankable,\u201D she\u2019s checked the actual lending patterns.' },
          ]} />

          <ScrollReveal delay={0.3}>
            <p className="max-w-3xl mt-10" style={{ fontSize: '17px', fontWeight: 500, color: '#1A1A18', lineHeight: 1.65 }}>
              The difference between asking ChatGPT about your business and asking Yulia is the difference between reading a Wikipedia article about surgery and consulting a specialist with your chart in front of them.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 3 — Seven Layers of Intelligence — Animated Timeline ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>METHODOLOGY</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
              Seven Layers of Intelligence&trade;
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              Not a checklist. A methodology. Every deal Yulia touches is analyzed through seven dimensions &mdash; each one drawing from different data sources, each one revealing something the others miss.
            </p>
          </ScrollReveal>

          <AnimatedTimeline>
            <div className="space-y-10">
              {[
                { num: '1', title: 'Industry Structure', body: 'Competitive density. Fragmentation vs. consolidation. NAICS-level benchmarking. Who\u2019s in your market and how your business compares.' },
                { num: '2', title: 'Regional Economics', body: 'MSA-level wage data. Cost of living. Business formation rates. Demographic trends. The local reality that national averages completely miss.' },
                { num: '3', title: 'Financial Normalization', body: 'SDE or EBITDA calculation. Add-back discovery. Trend analysis. Margin benchmarking against industry medians. The forensic work that separates real value from reported numbers.' },
                { num: '4', title: 'Buyer Landscape', body: 'Who\u2019s buying in this space right now? PE platforms, strategic acquirers, SBA-qualified individuals, search funds. Mapped to your specific sector and geography.' },
                { num: '5', title: 'Deal Architecture', body: 'Structure optimization. Asset sale vs. stock sale tax modeling. Financing scenarios. Earnout design. Working capital adjustment. The engineering of how the deal actually gets done.' },
                { num: '6', title: 'Risk Assessment', body: 'Customer concentration. Owner dependency. Key person risk. Regulatory exposure. Legal transfer requirements. Revenue sustainability. Every risk identified before it becomes a surprise in diligence.' },
                { num: '7', title: 'Forward Signals', body: 'Industry growth projections. Wage inflation impact. Regulatory changes on the horizon. Technology disruption indicators. Where the market is going, not just where it\u2019s been.' },
              ].map((item, i) => (
                <ScrollReveal key={item.num} delay={i * 0.08}>
                  <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                    <span style={{ fontSize: '48px', fontWeight: 700, color: '#D4714E', lineHeight: 1, minWidth: 40, textAlign: 'center', marginLeft: -8 }} className="shrink-0 mt-0.5">{item.num}</span>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A18', margin: '0 0 6px' }}>{item.title}</h3>
                      <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>{item.body}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </AnimatedTimeline>
        </div>
      </section>

      {/* ═══ Block 4 — Adaptive intelligence [FullBleed tinted] ═══ */}
      <FullBleedSection tinted className="mt-20">
        <ScrollReveal>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>ADAPTIVE INTELLIGENCE</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            A $400K landscaping company and a $40M manufacturing platform are fundamentally different deals.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Yulia doesn&apos;t give the same advice to every business. She classifies your deal by complexity and adapts everything &mdash; her vocabulary, methodology, financial metrics, deliverable depth, and the questions she asks.</p>
            <p className="m-0">An owner-operated pest control company gets SDE-based coaching, step-by-step guidance, and SBA-focused analysis.</p>
            <p className="m-0">A $20M EBITDA manufacturing platform gets institutional metrics, arbitrage modeling, covenant analysis, and board-level deliverables.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Same methodology. Same data sources. Same rigor. Calibrated to the deal in front of you.</p>
            <p className="m-0">That&apos;s why the platform serves every deal size &mdash; from $300K to $300M. Not because it&apos;s generic. Because it adapts.</p>
          </div>
        </ScrollReveal>
      </FullBleedSection>

      {/* ═══ Stat bar — deal range ═══ */}
      <section className="px-6" style={{ paddingTop: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <StatBar stats={[
            { label: 'Minimum deal size', value: 300, prefix: '$', suffix: 'K' },
            { label: 'Maximum deal size', value: 300, prefix: '$', suffix: 'M' },
            { label: 'Methodology layers', value: 7 },
            { label: 'Federal data sources', value: 5 },
          ]} />
        </div>
      </section>

      {/* ═══ Block 5 — Localized intelligence [FullBleed white] ═══ */}
      <FullBleedSection className="mt-10">
        <ScrollReveal>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>LOCALIZED INTELLIGENCE</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            National averages are noise. Your market is signal.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">A plumbing company in Phoenix and a plumbing company in rural Pennsylvania are fundamentally different deals. Different competitive density. Different wage structures. Different buyer pools. Different SBA lending patterns. Different growth trajectories.</p>
            <p className="m-0">Yulia delivers intelligence specific to your MSA &mdash; not your state, not your region, your metropolitan statistical area. The same geographic precision that institutional investors use, available to every dealmaker.</p>
            <p className="m-0">When Yulia tells you there are 14 active PE platforms acquiring HVAC companies in Texas, she&apos;s not estimating. When she says your EBITDA margin of 18.6% is below the 21% industry median for your MSA, she&apos;s not guessing. When she models SBA financing at today&apos;s rate with your regional lender&apos;s average approval metrics, she&apos;s not approximating.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Every number. Sourced. Traceable. Defensible.</p>
          </div>
        </ScrollReveal>
      </FullBleedSection>

      {/* ═══ Block 6 — Tax & Legal Intelligence [BentoGrid] ═══ */}
      <section className="px-6" style={{ paddingTop: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>TAX &amp; LEGAL INTELLIGENCE</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
              The decisions that move the number most aren&apos;t financial &mdash; they&apos;re structural.
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              Deal structure, entity type, state of residence, and asset allocation can swing net proceeds by $100K&ndash;$500K on a single deal. Yulia models the tax and legal landscape so you &mdash; and your CPA and attorney &mdash; can make informed decisions.
            </p>
          </ScrollReveal>

          <BentoGrid
            featuredIndex={[0, 1]}
            items={[
              { icon: '\uD83D\uDCB0', title: 'Deal structure tax modeling', body: 'Asset sale vs. stock sale. Side-by-side net proceeds for both parties. Depreciation recapture, capital gains, ordinary income allocation \u2014 modeled with real numbers for the specific deal.' },
              { icon: '\u26A0\uFE0F', title: 'Entity type flags', body: 'C-Corp double taxation trap. S-Corp built-in gains exposure. LLC hot asset rules. Sole proprietorship limitations. Yulia identifies entity-specific risks during intake and flags them immediately.' },
              { icon: '\uD83D\uDCCB', title: 'Purchase price allocation', body: 'Both buyer and seller file Form 8594 with matching allocation. How the purchase price is split across asset classes directly determines the tax bill. Yulia generates scenarios showing the impact of different allocations.' },
              { icon: '\uD83C\uDFE6', title: 'Installment sale modeling', body: 'When the deal includes seller financing, Yulia calculates year-by-year tax obligations \u2014 installment vs. lump sum \u2014 including depreciation recapture, imputed interest, and NPV comparison.' },
              { icon: '\uD83D\uDD12', title: 'QSBS screening', body: 'For qualifying C-Corp sellers, IRC \u00A71202 can exclude up to $10M in federal capital gains. Yulia checks the five eligibility requirements and flags state conformity issues (California only partially conforms).' },
              { icon: '\uD83D\uDCC4', title: 'APA preparation', body: 'Reps & warranties, indemnification, escrow, non-compete, working capital, lease assignment \u2014 Yulia explains every component in plain English and generates term sheets your attorney can convert to legal documents.' },
              { icon: '\uD83C\uDFE5', title: 'Regulatory transfer mapping', body: 'Healthcare, childcare, construction, food service, franchise \u2014 many industries require new license applications that take 1\u20136 months. Yulia checks the industry and builds the transfer timeline into the deal schedule.' },
            ]}
          />

          <ScrollReveal delay={0.2}>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 16, fontStyle: 'italic' }}>
              Yulia models the landscape and the math. Your CPA confirms the tax specifics. Your attorney drafts the legal documents. Everyone informed, everyone aligned.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 7 — Live example + CTA ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>LIVE EXAMPLE</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
              This took <AnimatedCounter value={47} style={{ color: '#D4714E' }} /> seconds.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="max-w-3xl mb-10" style={{ background: '#FAFAFA', borderRadius: 24, border: '1px solid rgba(0,0,0,0.04)', padding: '28px 32px' }}>
              <div className="space-y-6">
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(26,26,24,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>USER</span>
                  <p style={{ fontSize: '15px', color: '#1A1A18', margin: '6px 0 0', lineHeight: 1.6 }}>I&apos;m thinking about selling my commercial HVAC company. We&apos;re in Dallas-Fort Worth, about $4.2M in revenue and $780K in adjusted EBITDA last year.</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#D4714E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>YULIA</span>
                  <div className="mt-1.5 space-y-3" style={{ fontSize: '15px', color: 'rgba(26,26,24,0.65)', lineHeight: 1.6 }}>
                    <p className="m-0">Commercial HVAC in DFW &mdash; that&apos;s a strong combination right now. Let me run this through the methodology.</p>
                    <p className="m-0">Your $780K EBITDA puts you in the L3 range, which means we&apos;re looking at EBITDA-based multiples rather than SDE. For commercial HVAC in the Dallas-Fort Worth MSA, current multiples are running <strong>4.8&times;&ndash;6.2&times;</strong> based on recent comparable transactions and PE activity in the space.</p>
                    <p className="m-0">That gives you a preliminary enterprise value range of <strong>$3.74M&ndash;$4.84M</strong>.</p>
                    <p className="m-0">A few things that could push you toward the top of that range: DFW has 847 HVAC businesses per Census data, but commercial-focused operations are only about 12% of that. PE firms are actively consolidating HVAC &mdash; I&apos;m tracking 14 active platforms in Texas alone. Your EBITDA margin of 18.6% is solid but slightly below the 21% industry median, which means there&apos;s room to optimize before going to market.</p>
                    <p className="m-0" style={{ color: '#1A1A18', fontWeight: 500 }}>What&apos;s your total owner compensation &mdash; salary, benefits, and any personal expenses running through the business?</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              <p className="m-0">That&apos;s deal intelligence for a real business, in a real market, with real federal data &mdash; in under a minute. Not a template. Not a generic report. Analysis specific to your industry, your geography, your financials, and your deal complexity.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mt-10">
              <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about your deal and watch the intelligence unfold</p>
              <MagneticButton
                onClick={() => onChipClick("Tell me about your deal intelligence")}
                style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Start a conversation &rarr;
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
