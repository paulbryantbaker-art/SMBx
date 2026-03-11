import {
  RevealSection,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  DSCRCalculator,
  AnimatedTimeline,
  BeforeAfterSlider,
  MagneticButton,
} from './animations';

interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#D4714E' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid #DDD9D1', padding: '28px 32px' };

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ Block 1 — Any deal, any source ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>ANY DEAL &middot; ANY SOURCE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The most expensive mistake is three months on the wrong deal.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>Every day spent evaluating the wrong deal is a day you&apos;re not closing the right one. And in a market where good businesses sell in weeks, speed to conviction is everything.</p>
              <p>Bring it to Yulia. Paste a BizBuySell listing. Describe something your broker sent you. Tell her about a business you heard is for sale.</p>
              <p>Within minutes: financial validation against federal benchmarks, SBA financing modeled at live rates, competitive landscape mapped for that metro, risks flagged &mdash; and a clear answer. Pursue or pass.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>Every listing site in the world just became your top-of-funnel. smbX.ai is where you analyze them.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 2 — Five dimensions ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>DEAL EVALUATION &middot; FIVE DIMENSIONS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Five dimensions. One answer.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16 }}>Yulia gets you to conviction &mdash; fast.</p>
          </RevealSection>

          <div className="space-y-10" style={{ marginTop: 40 }}>
            {[
              { title: 'Financials', body: 'Seller claims $600K SDE. Census data says that implies 50% margins \u2014 realistic? Yulia checks against federal benchmarks, not guesswork.' },
              { title: 'Financing', body: '$1.8M asking, 10% down, live SBA rate: monthly P&I is $14,200. DSCR is 1.87 \u2014 above the 1.25 threshold. Bankable.' },
              { title: 'Market', body: '847 competitors in the metro. PE firms rolling up the sector. BLS wages growing 4%. Good market \u2014 or buying at the top?' },
              { title: 'Risks', body: 'Customer concentration. Owner dependency. Declining revenue. Yulia flags them before the seller\u2019s broker does.' },
              { title: 'Verdict', body: 'Pursue \u2014 with these conditions. Or pass \u2014 for these reasons. A real answer with real reasoning.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>{item.title}</h3>
                <p style={bodyStyle}>{item.body}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Interactive DSCR Calculator ═══ */}
      <section style={{ paddingTop: 100 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <DSCRCalculator />
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 3 — Free starting point ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>FREE STARTING POINT</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Before you pay anything, you get this.
            </h2>
          </RevealSection>

          <div className="space-y-4" style={{ marginTop: 40 }}>
            {[
              { title: 'Investment Thesis Document', body: 'Your acquisition blueprint \u2014 criteria, capital stack template, SBA eligibility, market landscape. What search funds build in-house with full-time analysts.' },
              { title: 'Capital Stack Template', body: '\u201CHere\u2019s how a $1.8M acquisition gets funded.\u201D SBA loan, equity, seller note, monthly debt service.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 12px' }}>{item.title}</h3>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.body}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          <RevealSection style={{ marginTop: 24 }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#D4714E', lineHeight: 1.65 }}>
              Both free. Both generated from your first conversation.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 4 — Before/After: Buyer tax benefits ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>TAX STRUCTURE &middot; BUYER PERSPECTIVE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The deal structure determines your true cost of ownership.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Asset sales and stock sales aren&apos;t just different for the seller. The structure directly affects your tax deductions &mdash; and your real return on investment.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <BeforeAfterSlider
              beforeLabel="STOCK SALE"
              afterLabel="ASSET SALE (BUYER-FAVORABLE)"
              beforeContent={
                <div style={{ background: '#F5F3EF', padding: '32px', minHeight: 280 }}>
                  <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.5 }}>
                    <div className="flex justify-between"><span>Basis step-up</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>No</span></div>
                    <div className="flex justify-between"><span>Goodwill amortization</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>None</span></div>
                    <div className="flex justify-between"><span>Equipment depreciation</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>Seller&apos;s schedule</span></div>
                    <div className="flex justify-between"><span>NPV of tax shields</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>~$0</span></div>
                    <div className="flex justify-between"><span>Inherited liabilities</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>ALL</span></div>
                  </div>
                </div>
              }
              afterContent={
                <div style={{ background: '#D4714E', padding: '32px', minHeight: 280 }}>
                  <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    <div className="flex justify-between"><span>Basis step-up</span><span style={{ color: '#fff', fontWeight: 600 }}>Yes</span></div>
                    <div className="flex justify-between"><span>Goodwill amortization</span><span style={{ color: '#fff', fontWeight: 600 }}>~$97K/yr</span></div>
                    <div className="flex justify-between"><span>Equipment depreciation</span><span style={{ color: '#fff', fontWeight: 600 }}>Fresh</span></div>
                    <div className="flex justify-between"><span>NPV of tax shields</span><span style={{ color: '#fff', fontWeight: 600 }}>~$304,000</span></div>
                    <div className="flex justify-between"><span>Inherited liabilities</span><span style={{ color: '#fff', fontWeight: 600 }}>Only agreed</span></div>
                  </div>
                </div>
              }
            />
          </RevealSection>

          <RevealSection style={{ marginTop: 24 }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', lineHeight: 1.65 }}>
              On a $2M deal, the asset sale tax shield is worth ~$304K to the buyer in present value. That&apos;s why buyers push for asset sales &mdash; and why sellers resist (they pay more tax). Yulia models both sides so you negotiate from the real numbers.
            </p>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 8, fontStyle: 'italic' }}>
              Your CPA should confirm the deduction schedule for your specific situation.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 5 — Legal due diligence ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>LEGAL DUE DILIGENCE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              What to verify before you sign.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              The APA protects you only if the reps and warranties are right. Yulia builds a due diligence checklist calibrated to the deal&apos;s industry, size, and structure.
            </p>
          </RevealSection>

          <div className="space-y-4" style={{ marginTop: 40 }}>
            {[
              { title: 'Reps & warranty review', body: 'The seller\u2019s factual statements about the business. Yulia identifies which reps are standard, which are missing, and which need broader language. Key focus: financial accuracy, no undisclosed liabilities, tax compliance, IP ownership, and material contracts.' },
              { title: 'Red flag scoring', body: 'Every DD finding gets scored: minor (proceed), major (negotiate price adjustment), or deal-breaker (walk away). Yulia calculates the dollar impact of each issue and recommends price adjustments.' },
              { title: 'Lease and location', body: 'Is the lease assignable? How much term remains? What will the landlord demand? If the business depends on the location, this is a potential deal-killer \u2014 Yulia flags it early.' },
              { title: 'Licenses and permits', body: 'Healthcare, childcare, construction, food service, pest control \u2014 many require new applications from you. Some take 3\u20136 months. Yulia checks the industry and builds the regulatory transfer timeline.' },
              { title: 'Employee transition', body: 'In an asset sale, employees are terminated by the seller and rehired by you. You choose who to hire. But prior liabilities (WARN Act, benefits, PTO) need to be clearly allocated.' },
              { title: 'Working capital mechanism', body: 'Fixed price? Peg with true-up? Locked box? The working capital adjustment is where deals get renegotiated after the LOI. Yulia calculates the trailing 12-month average.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>{item.title}</h3>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.body}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          <RevealSection style={{ marginTop: 16 }}>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', fontStyle: 'italic' }}>
              Your M&amp;A attorney drafts the actual APA. Yulia ensures you know what to expect, what to negotiate, and what to walk away from.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 6 — Animated Buyer Journey Timeline ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>BUYER JOURNEY &middot; GUIDED PROCESS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              From thesis to close &mdash; and 180 days beyond.
            </h2>
          </RevealSection>

          <div style={{ marginTop: 40 }}>
            <AnimatedTimeline>
              <div className="space-y-10">
                {[
                  { phase: 'Phase 1 \u2014 Define Your Thesis', body: 'What industry? Geography? Deal size? Yulia maps the market landscape.' },
                  { phase: 'Phase 2 \u2014 Evaluate & Build Conviction', body: 'Financial validation, SBA modeling, market analysis, risk assessment. Pursue or pass \u2014 with data.' },
                  { phase: 'Phase 3 \u2014 Negotiate & Win', body: 'First offer strategy. Seller financing leverage. Purchase price allocation negotiation. Your walk-away number. Real tactics.' },
                  { phase: 'Phase 4 \u2014 Due Diligence & Close', body: 'Organized deal room. DD checklist by industry. Red flag scoring. Price adjustment calculations. Working capital true-up modeling. Everyone in one workspace.' },
                  { phase: 'Phase 5 \u2014 Post-Acquisition \u00B7 180 Days', body: 'Day 1\u201330: Stabilize. Retain. Preserve. Day 30\u201390: Optimize. Quick wins. Day 90\u2013180: Grow. Execute the thesis. A customized plan for YOUR business.' },
                ].map((p, i) => (
                  <ScrollReveal key={p.phase} delay={i * 0.1}>
                    <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                      <div className="flex flex-col items-center shrink-0" style={{ marginLeft: -8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4714E', marginTop: 6, boxShadow: '0 0 0 4px rgba(212,113,78,0.15)' }} />
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

      {/* ═══ Block 7 — Buyer types ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>BUYER TYPES</span>
            <h2 style={h2Style} className="md:text-[48px]">
              First deal or fiftieth. Yulia adapts.
            </h2>
          </RevealSection>

          <StaggerContainer className="space-y-4" style={{ marginTop: 40 }}>
            {[
              { title: 'First-Time SBA Buyer', body: 'No jargon. Your pace. Tax and legal explained in plain English.' },
              { title: 'Search Fund', body: 'Thesis to close. Pipeline velocity. LOI-to-APA coaching.' },
              { title: 'PE Platform', body: 'Screen at deal-team speed. Arbitrage modeling. Covenant analysis.' },
              { title: 'Strategic', body: 'Synergies, structure, max value. Integration planning from Day 1.' },
            ].map(b => (
              <StaggerItem key={b.title}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 6px' }}>{b.title}</h3>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{b.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ Block 8 — The payoff + CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>You own a business. And you know exactly what to do with it.</p>
          </RevealSection>

          <RevealSection>
            <div className="space-y-6" style={bodyStyle}>
              <p>Not &ldquo;I hope this works out.&rdquo; Not &ldquo;I think I paid the right price.&rdquo; Not &ldquo;Now what?&rdquo;</p>
              <p>You have a plan. Specific to this business, this market, this thesis. Built from months of intelligence that Yulia gathered during the acquisition &mdash; carried forward into ownership.</p>
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
