import {
  RevealSection,
  AnimatedTimeline,
  ScrollReveal,
  MagneticButton,
  PulseBadge,
} from './animations';

interface IntegrateBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' };

export default function IntegrateBelow({ onChipClick }: IntegrateBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ THE 100-DAY WINDOW ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE 100-DAY WINDOW</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The first 100 days determine everything.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>You closed the deal. The employees are wondering what changes. The customers haven&apos;t been told. Move too fast and you lose the people who make the business work. Move too slow and the issues compound.</p>
              <p>70% of acquisitions fail to achieve their value thesis. Not because the thesis was wrong &mdash; because the execution was unstructured.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>Yulia carries everything she learned during months of analysis into a 180-day plan built for this specific business. Included in your plan.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Three-Phase Timeline ═══ */}
      <section style={{ paddingTop: 80 }}>
        <div style={sectionStyle}>
          <div>
            <AnimatedTimeline>
              <div className="space-y-10">
                {[
                  {
                    phase: 'Day 1\u201330 \u2014 Stabilize',
                    badge: 'CRITICAL',
                    body: 'Change every password. Transfer registrations. Update bank signatories. Meet every employee one-on-one. Call the top 20 customers. Resist the urge to optimize \u2014 understand why the business works before you change how it works.',
                  },
                  {
                    phase: 'Day 30\u201390 \u2014 Optimize',
                    body: 'Financial controls, operational gaps, KPI installation. The scheduling inefficiency that costs 10 billable hours per week. The quoting process that takes 3 days instead of 3 hours. Quick wins that build momentum.',
                  },
                  {
                    phase: 'Day 90\u2013180 \u2014 Grow',
                    body: 'Execute the value creation thesis. Revenue actual vs. modeled. EBITDA actual vs. modeled. Early warning signals when the thesis isn\u2019t playing out \u2014 and course corrections.',
                  },
                ].map((p, i) => (
                  <ScrollReveal key={p.phase} delay={i * 0.15}>
                    <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                      <div className="flex flex-col items-center shrink-0" style={{ marginLeft: -8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C96B4F', marginTop: 6, boxShadow: '0 0 0 4px rgba(212,113,78,0.15)' }} />
                      </div>
                      <div className="pb-2">
                        <span style={labelStyle}>
                          {p.phase}
                          {p.badge && <PulseBadge style={{ marginLeft: 8 }}>{p.badge}</PulseBadge>}
                        </span>
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

      {/* ═══ CTA ═══ */}
      <section style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>You own a business. And you know exactly what to do with it.</p>
          </RevealSection>

          <RevealSection>
            <div className="text-center">
              <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about your acquisition &rarr; integration plan in minutes</p>
              <MagneticButton
                onClick={() => onChipClick("I just acquired a business and need an integration plan")}
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
