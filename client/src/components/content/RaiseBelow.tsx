import {
  RevealSection,
  AnimatedTimeline,
  ScrollReveal,
  MagneticButton,
  StatBar,
  StaggerContainer,
  StaggerItem,
  PulseBadge,
} from './animations';

interface RaiseBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' };

export default function RaiseBelow({ onChipClick }: RaiseBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ Block 1 — The Capital Dilemma ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>CAPITAL STRATEGY</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The wrong capital costs more than the wrong price.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>Your business is working. Revenue is growing. You can see the next phase clearly &mdash; a second location, a new market, a strategic acquisition, a team that lets you scale beyond what you can do alone.</p>
              <p>But the capital landscape is more confusing than it should be &mdash; and the consequences of choosing wrong compound for years.</p>
              <p>A $2M raise at a $10M pre-money valuation gives up 17% of the company. The same raise at $15M pre-money gives up 12%. That 5% difference, over a five-year growth trajectory that ends in a $50M exit, is the difference between <strong style={{ color: '#1A1A18' }}>$8.5M and $6M</strong> in your pocket.</p>
              <p>Most founders negotiate their first term sheet against investors who&apos;ve drafted hundreds of them. The information asymmetry is enormous.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>Yulia starts with your goals, not the investor&apos;s.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Stat bar ═══ */}
      <section style={{ paddingTop: 80 }}>
        <div className="max-w-4xl mx-auto">
          <StatBar stats={[
            { label: 'Capital structures modeled', value: 5 },
            { label: 'Term sheet provisions analyzed', value: 12, suffix: '+' },
            { label: 'Dilution scenarios per round', value: 3 },
          ]} />
        </div>
      </section>

      {/* ═══ Block 2 — Capital Options ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>CAPITAL OPTIONS &middot; SIDE BY SIDE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Every structure has a cost. Know them all.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Yulia models every path so you see what you keep, what you give up, and how each affects your position in a future exit.
            </p>
          </RevealSection>

          <div style={{ marginTop: 40 }}>
            <AnimatedTimeline>
              <div className="space-y-10">
                {[
                  { icon: '💳', title: 'Revenue-Based Financing', detail: 'No equity dilution. Repayments flex with your revenue. 1.3\u00D7\u20132.0\u00D7 repayment cap over 12\u201336 months. Right for businesses with strong recurring revenue and predictable cash flow.' },
                  { icon: '🏦', title: 'SBA Expansion Loan', detail: 'Government-backed rates (9.75\u201312.25%). Up to $5M. 10\u201325 year terms. Keep 100% ownership. Collateral and personal guarantee required.' },
                  { icon: '📊', title: 'Equity Round', detail: 'Angel, VC, or strategic investor. Trade ownership for capital plus potentially expertise and connections. Yulia models dilution across multiple future rounds.' },
                  { icon: '🤝', title: 'Strategic Partnership', detail: 'Capital plus distribution, customers, or capabilities. Less dilutive than pure financial investors but comes with alignment constraints and governance complexity.' },
                  { icon: '📈', title: 'Mezzanine Debt', detail: 'Available for $2M+ EBITDA businesses. 12\u201320% all-in rates, 5\u20137 year terms. Expensive but non-dilutive. Minimums usually $3M.' },
                ].map((opt, i) => (
                  <ScrollReveal key={opt.title} delay={i * 0.1}>
                    <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                      <div className="flex flex-col items-center shrink-0" style={{ marginLeft: -8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C96B4F', marginTop: 6, boxShadow: '0 0 0 4px rgba(212,113,78,0.15)' }} />
                      </div>
                      <div className="pb-2">
                        <span style={{ ...labelStyle, fontSize: '13px', letterSpacing: '0.02em', textTransform: 'none' as const }}>
                          {opt.title}
                        </span>
                        <p style={{ ...bodyStyle, marginTop: 10, fontSize: '15px' }}>{opt.detail}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </AnimatedTimeline>
          </div>
        </div>
      </section>

      {/* ═══ Block 3 — The Materials That Win ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>INVESTOR MATERIALS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Investors see hundreds of pitches. Yours will be ready.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              The businesses that raise capital quickly have one thing in common: their materials make the investor&apos;s decision easy. Yulia builds the complete package from your actual data.
            </p>
          </RevealSection>

          <StaggerContainer style={{ marginTop: 40 }}>
            <div className="space-y-4">
              {[
                { title: 'Pitch Deck', badge: '12 slides', body: 'Problem, solution, market, traction, team, financials, ask \u2014 each slide built from your numbers, your market data, your competitive position. Market sizing uses bottom-up methodology with Census data.' },
                { title: 'Financial Model', badge: '3 statements', body: 'Income statement, balance sheet, cash flow \u2014 every assumption documented and adjustable. Revenue projections tied to specific growth drivers, not a growth rate pulled from air.' },
                { title: 'Cap Table Model', body: 'Pre-money and post-money ownership for this round. Dilution modeling across 2\u20133 future rounds. Liquidation waterfall \u2014 who gets paid what in a $10M vs $50M vs $200M exit.' },
                { title: 'Use of Funds', body: 'Specific hires, specific market expansion, specific milestones. Not \u201C50% growth, 30% team, 20% operations\u201D \u2014 a plan your investor can underwrite.' },
                { title: 'Investor Targeting', body: 'Angels, VCs, family offices, strategics \u2014 profiled and prioritized for your specific raise. Who\u2019s investing at your stage, in your industry, at your size.' },
              ].map(item => (
                <StaggerItem key={item.title}>
                  <div style={cardStyle}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: 0 }}>{item.title}</h3>
                      {item.badge && <PulseBadge>{item.badge}</PulseBadge>}
                    </div>
                    <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ Block 4 — Term Sheet Analysis ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>TERM SHEET INTELLIGENCE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              When the term sheet arrives, you&apos;ll understand every line.
            </h2>
          </RevealSection>

          <div className="space-y-5" style={{ marginTop: 32 }}>
            {[
              'Liquidation preference \u2014 1\u00D7 non-participating is standard. 2\u00D7 participating means the investor gets their money back twice before you see a dollar.',
              'Anti-dilution provisions \u2014 protect the investor in a down round at your expense. Full ratchet vs. weighted average matters enormously.',
              'Board seats \u2014 who controls decisions? Investor board seats shift power in ways founders don\u2019t discover until a critical vote.',
              'Pro-rata rights \u2014 existing investors can (but don\u2019t have to) participate in future rounds. Helpful or harmful depending on their appetite.',
              'Drag-along rights \u2014 can force you to sell when you don\u2019t want to. Understand the threshold before you sign.',
            ].map((item, i) => (
              <RevealSection key={i}>
                <div className="flex gap-4 items-start">
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#C96B4F', minWidth: 28, flexShrink: 0, borderLeft: '2px solid rgba(212,113,78,0.2)', paddingLeft: 10, lineHeight: '1.65' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p style={bodyStyle}>{item}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 5 — The Payoff + CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>Growth funded. Control preserved.</p>
          </RevealSection>

          <RevealSection>
            <div className="space-y-6" style={bodyStyle}>
              <p>You raised capital on your terms. You know what you gave up, what you kept, and why. The investors respected the preparation because it made their decision easy.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s what the process delivers: a relationship starting from a position of mutual respect.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about your raise &rarr; free capital strategy in minutes</p>
            <MagneticButton
              onClick={() => onChipClick("I need to raise capital for my business")}
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
