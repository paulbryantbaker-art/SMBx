import {
  RevealSection,
  ScrollReveal,
  AnimatedTimeline,
  MagneticButton,
  AnimatedCounter,
  ExpandableCard,
  SideBySideCard,
  ConversationPreview,
} from './animations';

interface HowItWorksBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 };

export default function HowItWorksBelow({ onChipClick }: HowItWorksBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. THE INFORMATION DESERT ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE INFORMATION DESERT</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Between $300K and $50M, nobody has good data.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>The largest institutions have Bloomberg, PitchBook, and armies of analysts. Fortune 500 deals have investment banks with $100M budgets.</p>
              <p>Business owners selling a $3M company have Google and gut instinct. Brokers managing 15 listings pull comps from memory. Buyers evaluating a listing check the asking price against&hellip; what, exactly?</p>
              <p>The data exists. It&apos;s in Census records, BLS reports, FRED economic series, SBA lending databases, SEC filings. But nobody has synthesized it into intelligence useful for making deal decisions.</p>
              <p style={{ color: '#0D0D0D', fontWeight: 600 }}>A business owner spends $24,000 per year on professional advisors who don&apos;t have access to the data that would make their advice twice as good.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 16 }}>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#0D0D0D', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>Until now.</p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. SEVEN LAYERS OF INTELLIGENCE ═══ */}
      <section style={{ paddingTop: 100 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>METHODOLOGY</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Seven Layers of Intelligence&trade;
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Not a checklist. A methodology. Every deal is analyzed through seven dimensions &mdash; each drawing from different data sources, each revealing something the others miss.
            </p>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 40 }}>
            {[
              { num: '1', title: 'Industry Structure', preview: 'Competitive density, fragmentation, NAICS benchmarking.', detail: 'Census business counts by industry, geography, and size class. When Yulia says "847 HVAC businesses in Dallas-Fort Worth," that\u2019s a Census number.' },
              { num: '2', title: 'Regional Economics', preview: 'MSA-level wage data, cost of living, formation rates.', detail: 'BLS wage benchmarks, employment trends, demographic data \u2014 for your specific metropolitan area, not a national average.' },
              { num: '3', title: 'Financial Normalization', preview: 'SDE/EBITDA, add-backs, margin benchmarking.', detail: 'The forensic work that separates real value from reported numbers. Trend analysis and margin comparison against industry medians.' },
              { num: '4', title: 'Buyer Landscape', preview: 'PE platforms, strategics, SBA buyers, search funds.', detail: 'Who\u2019s buying in this space right now? Mapped to your specific sector and geography using SEC EDGAR filings and market activity.' },
              { num: '5', title: 'Deal Architecture', preview: 'Structure optimization, financing, earnout design.', detail: 'Asset vs. stock sale modeling. SBA feasibility at live Fed rates. Working capital adjustment. The engineering of how the deal gets done.' },
              { num: '6', title: 'Risk Assessment', preview: 'Concentration, dependency, regulatory exposure.', detail: 'Customer concentration. Owner dependency. Key person risk. Revenue sustainability. Every risk identified before it becomes a surprise in diligence.' },
              { num: '7', title: 'Forward Signals', preview: 'Growth projections, wage inflation, disruption indicators.', detail: 'Where the market is going, not just where it\u2019s been. Industry projections, regulatory changes, technology disruption \u2014 the context that frames the deal\u2019s future value.' },
            ].map(item => (
              <RevealSection key={item.num}>
                <ExpandableCard title={`${item.num}. ${item.title}`} preview={item.preview}>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.detail}</p>
                </ExpandableCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. LEAGUE-ADAPTIVE INTELLIGENCE ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>LEAGUE-ADAPTIVE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              A $400K landscaping company and a $40M platform are different deals.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Yulia classifies your deal by complexity and adapts everything &mdash; vocabulary, metrics, deliverable depth, and the questions she asks.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <SideBySideCard
              leftLabel="OWNER-OPERATED ($300K\u2013$2M)"
              rightLabel="INSTITUTIONAL ($10M+)"
              leftItems={[
                { label: 'Metric', value: 'SDE' },
                { label: 'Multiples', value: '2.0\u20133.5\u00D7' },
                { label: 'Financing', value: 'SBA 7(a)' },
                { label: 'Persona', value: 'Coach' },
              ]}
              rightItems={[
                { label: 'Metric', value: 'EBITDA' },
                { label: 'Multiples', value: '8.0\u201312.0\u00D7' },
                { label: 'Financing', value: 'Leveraged' },
                { label: 'Persona', value: 'Partner' },
              ]}
            />
          </RevealSection>

          <RevealSection style={{ marginTop: 24 }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#0D0D0D', lineHeight: 1.65 }}>
              Same methodology. Same Seven Layers. Same rigor. Calibrated to the deal in front of you. That&apos;s why the platform serves every deal size &mdash; not because it&apos;s generic, because it adapts.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 4. LOCALIZED INTELLIGENCE ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>LOCALIZED INTELLIGENCE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Your market. Not the national average.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>When Yulia tells you there are 14 active PE platforms acquiring HVAC companies in Texas, she&apos;s not estimating. When she says your EBITDA margin is below the industry median for your MSA, she&apos;s not guessing. When she models SBA financing at today&apos;s rate with your regional lender&apos;s patterns, she&apos;s not approximating.</p>
              <p style={{ color: '#0D0D0D', fontWeight: 600 }}>Every number. Sourced. Traceable. Defensible.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 5. CONVERSATION PREVIEW ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>LIVE EXAMPLE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              This took <AnimatedCounter value={47} style={{ color: '#C96B4F' }} /> seconds.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <ConversationPreview
              messages={[
                { role: 'user', text: "I'm thinking about selling my commercial HVAC company. We're in Dallas-Fort Worth, about $4.2M revenue and $780K EBITDA." },
                { role: 'ai', text: "Commercial HVAC in DFW \u2014 strong combination. Your $780K EBITDA puts you in L3 range: EBITDA-based multiples of 4.8\u00D7\u20136.2\u00D7. Preliminary enterprise value: $3.74M\u2013$4.84M. DFW has 847 HVAC businesses (Census), but only ~12% commercial-focused. 14 active PE platforms in Texas. Your 18.6% EBITDA margin is solid but below the 21% median \u2014 optimization opportunity." },
                { role: 'user', text: "What would it take to get to the top of that range?" },
                { role: 'ai', text: "Three moves: (1) Close the margin gap \u2014 21% vs your 18.6% adds ~$100K EBITDA. At 5.5\u00D7, that's $550K in enterprise value. (2) Reduce owner dependency \u2014 document the 3-4 client relationships only you manage. (3) Lock in the recurring maintenance contracts \u2014 PE buyers pay premium multiples for recurring revenue. I can build your optimization plan with specific timelines." },
              ]}
            />
          </RevealSection>

          <RevealSection style={{ marginTop: 24 }}>
            <p style={bodyStyle}>
              Real business, real market, real federal data &mdash; in under a minute. Not a template. Analysis specific to your industry, geography, and financials.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 6. THE CHATGPT QUESTION ═══ */}
      <section style={{ paddingTop: 140, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE CHATGPT QUESTION</span>
            <h2 style={h2Style} className="md:text-[48px]">
              &ldquo;Can&apos;t I just use ChatGPT?&rdquo;
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>ChatGPT generates plausible text about M&amp;A concepts. It can explain what SDE means and list common add-backs.</p>
              <p>Yulia analyzes <em>your</em> deal against real federal data \u2014 Census, BLS, FRED, SEC EDGAR, SBA \u2014 with a structured methodology calibrated to your industry, geography, and deal size. Every number sourced. Every insight traceable.</p>
              <p>The difference is the difference between reading a Wikipedia article about surgery and consulting a specialist with your chart in front of them.</p>
              <p style={{ color: '#0D0D0D', fontWeight: 600 }}>One gives you information. The other gives you intelligence.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.5)', marginBottom: 16 }}>Tell Yulia about your deal and watch the intelligence unfold</p>
            <MagneticButton
              onClick={() => onChipClick("Tell me about your deal intelligence")}
              style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Start a conversation &rarr;
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
