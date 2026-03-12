import {
  RevealSection,
  StaggerContainer,
  StaggerItem,
  MagneticButton,
} from './animations';

interface PricingBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#D4714E' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid #C5C0B6', padding: '24px 28px' };

export default function PricingBelow({ onChipClick }: PricingBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ Block 1 — Everything included ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>$49 / MONTH</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Everything included. No meter running.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Every deliverable Yulia can generate is included in your subscription. Valuations, CIMs, LOIs, SBA models, tax structure analysis, deal data rooms &mdash; all of it.
            </p>
          </RevealSection>

          <StaggerContainer className="space-y-4" style={{ marginTop: 40 }}>
            {[
              'Unlimited Yulia conversations',
              'All 4 journeys: Sell, Buy, Raise, Integrate',
              'Business valuation with full methodology',
              'Living CIM \u2014 updates as your financials improve',
              'SBA financing model (automatic for eligible deals)',
              'LOI drafting with negotiation intelligence',
              'Due diligence checklist, stage-appropriate',
              'Quality of Earnings analysis',
              'Financial model with acquisition returns',
              'Tax structure intelligence (stock vs. asset, \u00A7453, C-Corp)',
              'Deal data room with auto-filing and versioning',
              '180-day PMI plan on deal close',
              'Bizestimate \u2014 living valuation range, always free',
              'Multi-party deal room (attorney, CPA, lender access)',
            ].map(item => (
              <StaggerItem key={item}>
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: '16px', color: '#D4714E', fontWeight: 700 }} className="shrink-0">{'\u2713'}</span>
                  <span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.6)' }}>{item}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ Block 2 — The difference ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE DIFFERENCE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              ChatGPT will tell you what a CIM is. Yulia will write yours.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>General AI can explain M&amp;A concepts. Yulia runs the process &mdash; with your numbers, at your stage, with your specific deal in memory.</p>
              <p>The methodology, the deliverables, the sequence. She runs a 22-gate structured process &mdash; not a chat window. And she generates documents you can hand to a bank or attorney, not text you have to format yourself.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>$49/month is what that&apos;s worth.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 3 — Teams ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <div style={{ ...cardStyle, padding: '32px' }}>
              <span style={{ ...labelStyle, display: 'block', marginBottom: 16 }}>FOR TEAMS AND ADVISORS</span>
              <h3 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 16 }} className="md:text-[36px]">
                $49/month per person.
              </h3>
              <div className="space-y-4" style={bodyStyle}>
                <p>An advisory firm with 5 advisors pays $245/month total. No per-firm licensing. No seat minimums. Every team member gets full access to every deliverable.</p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 4 — What we don't charge for ═══ */}
      <section style={{ paddingTop: 100 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>WHAT WE DON&apos;T CHARGE FOR</span>
          </RevealSection>

          <StaggerContainer className="space-y-4" style={{ marginTop: 32 }}>
            {[
              'Close fees \u2014 they create friction at the worst moment',
              'Per-deliverable charges \u2014 everything is included',
              'Seat minimums \u2014 pay only for the people who use it',
              'Tax or legal opinions \u2014 Yulia models the landscape and the math; your CPA and attorney provide the advice',
            ].map(item => (
              <StaggerItem key={item}>
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: '20px', color: 'rgba(26,26,24,0.15)', fontWeight: 700 }} className="shrink-0">&#10007;</span>
                  <span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)' }}>{item}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ Block 5 — CTA ═══ */}
      <section style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>One price. Every deliverable. Every journey.</p>
          </RevealSection>

          <RevealSection>
            <div className="text-center">
              <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>7-day free trial. No credit card required.</p>
              <MagneticButton
                onClick={() => onChipClick("Start a free analysis")}
                style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Start chatting &rarr;
              </MagneticButton>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
