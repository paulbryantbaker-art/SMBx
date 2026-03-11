import {
  RevealSection,
  StatBar,
  AnimatedCounter,
  BeforeAfterSlider,
  MagneticButton,
} from './animations';

interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#D4714E' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid #C5C0B6', padding: '24px 28px' };

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ Block 1 — The offer ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE OFFER</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Three deals. Completely free. Then decide.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>We don&apos;t ask you to subscribe to something you haven&apos;t tried. We don&apos;t demo it in a sales call. We don&apos;t send you a deck. We let you use it.</p>
              <p>Run three complete client journeys through smbX.ai &mdash; valuations, CIMs, market reports, buyer qualification, the whole thing &mdash; free. White-label everything. Your clients see your deliverables, your brand, your expertise.</p>
              <p>After three journeys, it works like everyone else&apos;s wallet: fund as you go, spend per deliverable. No per-seat licensing. No monthly minimum.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>An advisor who sees Yulia generate a CIM in 30 minutes vs. 3 weeks doesn&apos;t need a sales pitch.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 2 — What changes ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>WHAT CHANGES</span>
            <h2 style={h2Style} className="md:text-[48px]">
              <AnimatedCounter value={68} style={{ color: '#D4714E' }} /> hours back. Every month.
            </h2>
          </RevealSection>

          <div className="space-y-10" style={{ marginTop: 40 }}>
            {[
              { title: 'Listing Prep \u2014 30 minutes, not 12 hours', body: 'Financials \u2192 normalized \u2192 add-backs identified \u2192 valuation range \u2192 CIM generated. You review. You refine. You present under your brand. What used to consume a full day happens before your morning coffee gets cold.' },
              { title: 'Buyer Qualification \u2014 seconds, not hours', body: 'SBA eligible? Down payment sufficient? DSCR in range? Know before your first call. Stop wasting time on buyers who can\u2019t close.' },
              { title: 'Buy Mandate Intelligence', body: 'Client wants to acquire. Yulia maps the market landscape \u2014 competitive density, available targets, PE activity, recent multiples \u2014 and evaluates opportunities against the thesis. Your client gets institutional research. You get a deeper relationship.' },
              { title: 'White-Label Everything', body: 'Your clients see your deliverables. They don\u2019t know the smbX.ai Engine built the analytical foundation. The intelligence elevates your practice. The credit stays with you.' },
              { title: 'Deals You\u2019d Otherwise Turn Away', body: '$800K landscaping company. $1.2M cleaning service. The deals that aren\u2019t worth your time at current economics \u2014 profitable now. Because the analytical work that made them unprofitable just got 90% faster.' },
              { title: 'Tax & Legal Prep \u2014 built in', body: 'Deal structure comparison, entity-type flags, purchase price allocation scenarios, non-compete enforceability by state, regulatory transfer timelines \u2014 included in every engagement. The analysis your clients\u2019 CPAs and attorneys need, generated before the first meeting.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>{item.title}</h3>
                <p style={bodyStyle}>{item.body}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 3 — The economics ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE ECONOMICS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              You know the bottleneck. Here&apos;s what changes.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <BeforeAfterSlider
              beforeLabel="WITHOUT YULIA"
              afterLabel="WITH YULIA"
              beforeContent={
                <div style={{ background: '#EDEAE4', padding: '32px', minHeight: 220 }}>
                  <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.5 }}>
                    <div className="flex justify-between"><span>Hours on data/docs</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>~80 hrs/mo</span></div>
                    <div className="flex justify-between"><span>Deals turned away</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>3&ndash;4/mo</span></div>
                    <div className="flex justify-between"><span>Revenue capacity</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>Limited</span></div>
                  </div>
                </div>
              }
              afterContent={
                <div style={{ background: '#D4714E', padding: '32px', minHeight: 220 }}>
                  <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    <div className="flex justify-between"><span>Hours on data/docs</span><span style={{ color: '#fff', fontWeight: 600 }}>~12 hrs/mo</span></div>
                    <div className="flex justify-between"><span>Deals turned away</span><span style={{ color: '#fff', fontWeight: 600 }}>0</span></div>
                    <div className="flex justify-between"><span>Revenue capacity</span><span style={{ color: '#fff', fontWeight: 600 }}>Expanded</span></div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 20, paddingTop: 20 }}>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>= 68 hours back every month</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '4px 0 0' }}>= 4&ndash;6 more deals per month</p>
                  </div>
                </div>
              }
            />
          </RevealSection>

          <div style={{ marginTop: 24 }}>
            <StatBar stats={[
              { label: 'Hours saved monthly', value: 68 },
              { label: 'Extra deals/month', value: 5 },
              { label: 'Faster analytics', value: 90, suffix: '%' },
            ]} />
          </div>
        </div>
      </section>

      {/* ═══ Block 4 — Partnership tiers ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>PARTNERSHIP TIERS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Shape the product. Grow with us.
            </h2>
          </RevealSection>

          <div className="space-y-4" style={{ marginTop: 40 }}>
            {[
              { title: 'Verified Advisor', body: 'Directory listing + platform matching. Clients looking for professional guidance get connected to you.' },
              { title: 'Premier Partner', body: 'Volume pricing + priority matching. For practices with steady deal flow that want a deeper integration.' },
              { title: 'Elite Partner', body: 'Custom integrations + product roadmap input. You\u2019re not just using the platform \u2014 you\u2019re shaping what it becomes.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 6px' }}>{item.title}</h3>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.body}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 5 — CTA ═══ */}
      <section style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>Your expertise. Yulia&apos;s engine. Their outcome.</p>
          </RevealSection>

          <RevealSection>
            <div className="text-center">
              <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about the deal you&apos;re working on &rarr; 3 free journeys</p>
              <MagneticButton
                onClick={() => onChipClick("I'm an advisor \u2014 tell me about partnerships")}
                style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
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
