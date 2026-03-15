import {
  RevealSection,
  ScrollReveal,
  DSCRCalculator,
  AnimatedTimeline,
  MagneticButton,
  SideBySideCard,
  DataCard,
  ExpandableCard,
  StaggerContainer,
  StaggerItem,
} from './animations';

interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' };

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. SPEED TO CONVICTION ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>SPEED TO CONVICTION</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The most expensive mistake is three months on the wrong deal.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>Every day on the wrong deal is a day you&apos;re not closing the right one. In a market where good businesses sell in weeks, speed to conviction is everything.</p>
              <p>Paste a BizBuySell listing. Describe a deal your broker sent. Tell Yulia about a business you heard is for sale.</p>
              <p>Within minutes: financial validation against federal benchmarks, SBA financing modeled at live rates, competitive landscape mapped, risks flagged &mdash; and a clear answer.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>Pursue or pass. With the data to back it up. Free.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. THE SBA EQUATION ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE SBA EQUATION</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Know if it&apos;s bankable before you make the call.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              SBA 7(a) loans finance most small business acquisitions. Yulia models the full equation at live rates so you know the real monthly payment before you talk to a lender.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <DSCRCalculator />
          </RevealSection>

          <RevealSection style={{ marginTop: 24 }}>
            <DataCard
              label="SBA 7(a) \u2014 KEY THRESHOLDS"
              rows={[
                { label: 'Minimum DSCR', value: '1.25\u00D7', highlight: true },
                { label: 'Max loan amount', value: '$5,000,000' },
                { label: 'Typical down payment', value: '10\u201320%' },
                { label: 'Term (with real estate)', value: '25 years' },
                { label: 'Term (without)', value: '10 years' },
              ]}
            />
          </RevealSection>
        </div>
      </section>

      {/* ═══ 3. THE MARKET MAP ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE MARKET MAP</span>
            <h2 style={h2Style} className="md:text-[48px]">
              National averages are noise. Your market is signal.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>A plumbing company in Phoenix and a plumbing company in rural Pennsylvania are fundamentally different deals. Different competitive density, wage structures, buyer pools, and SBA lending patterns.</p>
              <p>Yulia delivers intelligence specific to your MSA &mdash; not your state, not your region, your metropolitan statistical area. The same geographic precision that institutional investors use.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>Every number. Sourced. Traceable. Included in your plan.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 4. BUYER TAX ADVANTAGE ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>BUYER TAX ADVANTAGE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The deal structure determines your true cost of ownership.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Asset sales aren&apos;t just different for the seller. The structure directly affects your tax deductions &mdash; and your real return.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <SideBySideCard
              leftLabel="STOCK SALE"
              rightLabel="ASSET SALE (BUYER-FAVORABLE)"
              leftItems={[
                { label: 'Basis step-up', value: 'No' },
                { label: 'Goodwill amortization', value: 'None' },
                { label: 'Equipment depreciation', value: "Seller's schedule" },
                { label: 'NPV of tax shields', value: '~$0' },
              ]}
              rightItems={[
                { label: 'Basis step-up', value: 'Yes' },
                { label: 'Goodwill amortization', value: '~$97K/yr' },
                { label: 'Equipment depreciation', value: 'Fresh' },
                { label: 'NPV of tax shields', value: '~$304,000' },
              ]}
            />
          </RevealSection>

          <RevealSection style={{ marginTop: 24 }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A18', lineHeight: 1.65 }}>
              On a $2M deal, the asset sale tax shield is worth ~$304K in present value. That&apos;s why buyers push for asset sales. Yulia models both sides so you negotiate from real numbers.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 5. NEGOTIATION INTELLIGENCE ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>NEGOTIATION INTELLIGENCE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The seller&apos;s broker does this fifty times a year.
            </h2>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 40 }}>
            {[
              { title: 'First Offer Strategy', preview: 'Where to anchor and why.', detail: 'Your first offer sets the negotiation range. Yulia calculates the optimal starting point based on the deal\u2019s financials, comparable transactions, and the seller\u2019s likely reservation price.' },
              { title: 'Seller Financing Leverage', preview: 'Turn the capital stack into a negotiation tool.', detail: 'When SBA won\u2019t cover the full deal, a seller note bridges the gap. Yulia models how much seller financing to request and how to structure it as leverage: lower price, or seller note.' },
              { title: 'Purchase Price Allocation', preview: 'The negotiation most buyers don\u2019t know about.', detail: 'How the price is split across asset classes determines your tax bill for years. Maximizing goodwill (15-year amortization) vs. equipment (5\u20137 year depreciation) can be worth tens of thousands.' },
              { title: 'Working Capital Mechanism', preview: 'Where deals get renegotiated after the LOI.', detail: 'Fixed price? Peg with true-up? Locked box? Yulia calculates the trailing 12-month average and recommends the right mechanism for your deal.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <ExpandableCard title={item.title} preview={item.preview}>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.detail}</p>
                </ExpandableCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. THE FULL JOURNEY ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE FULL JOURNEY</span>
            <h2 style={h2Style} className="md:text-[48px]">
              From thesis to close &mdash; and 180 days beyond.
            </h2>
          </RevealSection>

          <div style={{ marginTop: 40 }}>
            <AnimatedTimeline>
              <div className="space-y-10">
                {[
                  { phase: 'Phase 1 \u2014 Define Your Thesis', body: 'What industry? Geography? Deal size? Yulia maps the market landscape and builds your acquisition criteria.' },
                  { phase: 'Phase 2 \u2014 Evaluate & Build Conviction', body: 'Financial validation, SBA modeling, market analysis, risk assessment. Pursue or pass \u2014 with data.' },
                  { phase: 'Phase 3 \u2014 Negotiate & Win', body: 'First offer strategy. Seller financing leverage. Purchase price allocation. Walk-away number. Real tactics.' },
                  { phase: 'Phase 4 \u2014 Due Diligence & Close', body: 'Organized deal room. DD checklist by industry. Red flag scoring. Price adjustments. Working capital true-up.' },
                  { phase: 'Phase 5 \u2014 Post-Acquisition \u00B7 180 Days', body: 'Day 1\u201330: Stabilize and retain. Day 30\u201390: Optimize and find quick wins. Day 90\u2013180: Execute the thesis.' },
                ].map((p, i) => (
                  <ScrollReveal key={p.phase} delay={i * 0.1}>
                    <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                      <div className="flex flex-col items-center shrink-0" style={{ marginLeft: -8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C96B4F', marginTop: 6, boxShadow: '0 0 0 4px rgba(212,113,78,0.15)' }} />
                      </div>
                      <div className="pb-2">
                        <span style={labelStyle}>{p.phase}</span>
                        <p style={{ ...bodyStyle, marginTop: 10 }}>{p.body}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </AnimatedTimeline>
          </div>
        </div>
      </section>

      {/* ═══ 7. EVERY TYPE OF BUYER ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>EVERY TYPE OF BUYER</span>
            <h2 style={h2Style} className="md:text-[48px]">
              First deal or fiftieth. Yulia adapts.
            </h2>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 40 }}>
            {[
              { title: 'First-Time SBA Buyer', preview: 'No jargon. Your pace.', detail: 'SDE-based analysis, step-by-step guidance, SBA-focused financing. Tax and legal explained in plain English because this is probably your first deal.' },
              { title: 'Search Fund', preview: 'Thesis to close. Pipeline velocity.', detail: 'Investment thesis refinement, deal screening at speed, LOI-to-APA coaching. The analytical support a traditional search fund charges $100K+ for.' },
              { title: 'PE Platform', preview: 'Screen at deal-team speed.', detail: 'EBITDA-based metrics, arbitrage modeling, covenant analysis, add-on evaluation. Institutional depth for institutional buyers.' },
              { title: 'Strategic Acquirer', preview: 'Synergies, structure, max value.', detail: 'Synergy quantification, integration planning from Day 1, competitive process analysis. The strategic rationale that justifies paying a premium.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <ExpandableCard title={item.title} preview={item.preview}>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.detail}</p>
                </ExpandableCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. THE PAYOFF + CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>You own a business. And you know exactly what to do with it.</p>
          </RevealSection>

          <RevealSection>
            <div className="space-y-6" style={bodyStyle}>
              <p>Not &ldquo;I hope this works out.&rdquo; Not &ldquo;I think I paid the right price.&rdquo;</p>
              <p>You have a plan. Specific to this business, this market, this thesis. Built from months of intelligence that Yulia gathered during the acquisition.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s the difference between buying a business and building wealth.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia what you&apos;re looking for &rarr; free acquisition thesis</p>
            <MagneticButton
              onClick={() => onChipClick("I'm looking to buy a business")}
              style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Message Yulia &rarr;
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
