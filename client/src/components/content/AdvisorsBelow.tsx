import {
  RevealSection,
  MagneticButton,
  ExpandableCard,
} from './animations';

interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '24px 28px' };

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. THE ADVISOR'S LEVERAGE ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE ADVISOR&apos;S LEVERAGE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              20 hours per CIM. 12 hours per listing prep. Zero hours for the deals you turn away.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>The bottleneck in every advisory practice is the same: the analytical work that makes your expertise valuable takes too long to produce.</p>
              <p>CIMs that take days. Valuations that require manual comp searches. Market reports that involve hours of data assembly. Buyer qualification that could be done in seconds.</p>
              <p>Meanwhile, the $800K landscaping company and the $1.2M cleaning service get turned away because the economics don&apos;t work at current production costs.</p>
              <p style={{ color: '#0D0D0D', fontWeight: 600 }}>Run your first three client journeys free. Valuations, CIMs, market intelligence, buyer qualification &mdash; the whole thing. White-label everything. Then decide.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. PARTNER TIERS ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>PARTNER TIERS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Shape the product. Grow with us.
            </h2>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 40 }}>
            {[
              {
                title: 'Certified Advisor',
                preview: 'Directory listing + platform matching.',
                detail: 'Clients looking for professional guidance get connected to you. Your smbX.ai profile shows your specialization, deal size focus, and geographic coverage. Referral fees on matched engagements.',
              },
              {
                title: 'Premier Partner',
                preview: 'Volume pricing + priority matching.',
                detail: 'For practices with steady deal flow. Reduced per-journey pricing, priority client matching, co-branded deliverables. Quarterly business review with the smbX.ai team.',
              },
              {
                title: 'Elite Partner',
                preview: 'Custom integrations + product roadmap input.',
                detail: 'You\u2019re not just using the platform \u2014 you\u2019re shaping what it becomes. Custom API integrations, white-label portal for your practice, early access to new features. Direct input on the product roadmap.',
              },
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

      {/* ═══ 3. THE PAYOFF + CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#0D0D0D', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>Your expertise. Yulia&apos;s engine. Their outcome.</p>
          </RevealSection>

          <RevealSection>
            <div className="text-center">
              <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.5)', marginBottom: 16 }}>Tell Yulia about the deal you&apos;re working on &rarr; 3 free journeys</p>
              <MagneticButton
                onClick={() => onChipClick("I'm an advisor \u2014 tell me about partnerships")}
                style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Message Yulia &rarr;
              </MagneticButton>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
