import {
  RevealSection,
  AnimatedTimeline,
  ScrollReveal,
  MagneticButton,
  StaggerContainer,
  StaggerItem,
  PulseBadge,
  ExpandableCard,
} from './animations';

interface RaiseBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' };

export default function RaiseBelow({ onChipClick }: RaiseBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. THE CAPITAL DILEMMA ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE CAPITAL DILEMMA</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The wrong capital costs more than the wrong price.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>Your business is working. You can see the next phase clearly &mdash; a second location, a new market, a strategic acquisition.</p>
              <p>But the capital landscape is more confusing than it should be. A $2M raise at $10M pre-money gives up 17%. The same raise at $15M pre-money gives up 12%. Over a five-year trajectory ending in a $50M exit, that 5% difference is <strong style={{ color: '#0D0D0D' }}>$2.5M in your pocket</strong>.</p>
              <p style={{ color: '#0D0D0D', fontWeight: 600 }}>Yulia models every structure so you negotiate from knowledge, not hope.</p>
            </div>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 40 }}>
            {[
              { title: 'Revenue-Based Financing', preview: 'No dilution. Payments flex with revenue.', detail: '1.3\u00D7\u20132.0\u00D7 repayment cap over 12\u201336 months. Right for businesses with strong recurring revenue and predictable cash flow. No equity given up.' },
              { title: 'SBA Expansion Loan', preview: 'Government-backed rates. Keep 100% ownership.', detail: 'Up to $5M at 9.75\u201312.25%. 10\u201325 year terms. Collateral and personal guarantee required. The least expensive capital for qualifying businesses.' },
              { title: 'Equity Round', preview: 'Trade ownership for capital plus expertise.', detail: 'Angel, VC, or strategic investor. Yulia models dilution across multiple future rounds so you understand the cumulative impact before you sign.' },
              { title: 'Strategic Partnership', preview: 'Capital plus distribution and capabilities.', detail: 'Less dilutive than pure financial investors but comes with alignment constraints. Yulia evaluates the strategic fit and models the governance implications.' },
              { title: 'Mezzanine Debt', preview: '$2M+ EBITDA businesses. Non-dilutive but expensive.', detail: '12\u201320% all-in rates, 5\u20137 year terms. Minimums usually $3M. Expensive but keeps your equity intact. Yulia models the cash flow impact.' },
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

      {/* ═══ 2. THE MATERIALS THAT WIN ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE MATERIALS THAT WIN</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Investors see hundreds of pitches. Yours will be ready.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              The businesses that raise capital quickly have one thing in common: their materials make the investor&apos;s decision easy. Yulia builds the complete package from your actual data. Included in your plan.
            </p>
          </RevealSection>

          <StaggerContainer style={{ marginTop: 40 }}>
            <div className="space-y-4">
              {[
                { title: 'Pitch Deck', badge: '12 slides', body: 'Problem, solution, market, traction, team, financials, ask \u2014 each slide built from your numbers and market data. Market sizing uses bottom-up methodology with Census data.' },
                { title: 'Financial Model', badge: '3 statements', body: 'Income statement, balance sheet, cash flow. Every assumption documented and adjustable. Revenue projections tied to specific growth drivers.' },
                { title: 'Cap Table Model', body: 'Pre- and post-money ownership. Dilution modeling across 2\u20133 future rounds. Liquidation waterfall \u2014 who gets paid what in a $10M vs $50M vs $200M exit.' },
              ].map(item => (
                <StaggerItem key={item.title}>
                  <div style={cardStyle}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0D0D0D', margin: 0 }}>{item.title}</h3>
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

      {/* ═══ 3. THE PAYOFF + CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#0D0D0D', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>Growth funded. Control preserved.</p>
          </RevealSection>

          <RevealSection>
            <div className="space-y-6" style={bodyStyle}>
              <p>You raised capital on your terms. You know what you gave up, what you kept, and why.</p>
              <p style={{ color: '#0D0D0D', fontWeight: 600 }}>The investors respected the preparation because it made their decision easy.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.5)', marginBottom: 16 }}>Tell Yulia about your raise &rarr; free capital strategy in minutes</p>
            <MagneticButton
              onClick={() => onChipClick("I need to raise capital for my business")}
              style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Message Yulia &rarr;
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
