import {
  RevealSection,
  AnimatedTimeline,
  ScrollReveal,
  MagneticButton,
  StatBar,
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
      {/* ═══ Block 1 — The 100-Day Window ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>POST-ACQUISITION</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The first 100 days determine everything.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>You closed the deal. The wire went out. The employees are wondering what changes. The customers haven&apos;t been told yet. The vendors are waiting to hear from the new owner.</p>
              <p>Move too fast and you lose the people who make the business work. Move too slow and the operational issues you identified during due diligence compound.</p>
              <p>70% of acquisitions fail to achieve their value thesis. Not because the thesis was wrong &mdash; because the execution was unstructured.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>Yulia carries forward everything she learned during months of analysis into a 180-day integration plan built for this specific business.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Stat bar ═══ */}
      <section style={{ paddingTop: 80 }}>
        <div className="max-w-4xl mx-auto">
          <StatBar stats={[
            { label: 'Day Zero checklist items', value: 40, suffix: '+' },
            { label: 'Integration phases', value: 3 },
            { label: 'Days of structured guidance', value: 180 },
          ]} />
        </div>
      </section>

      {/* ═══ Block 2 — Three-Phase Integration ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>180-DAY PLAN &middot; THREE PHASES</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Stabilize. Optimize. Grow.
            </h2>
          </RevealSection>

          <div style={{ marginTop: 40 }}>
            <AnimatedTimeline>
              <div className="space-y-10">
                {[
                  {
                    phase: 'Day 1\u201330 \u2014 Stabilize',
                    badge: 'CRITICAL',
                    items: [
                      { title: 'Security first', body: 'Change every password. Transfer domain registrations. Update bank signatories. Review insurance policies. Secure physical access.' },
                      { title: 'People next', body: 'Meet every employee personally \u2014 one-on-one, not a group meeting. Call the top 20 customers. Contact every critical vendor.' },
                      { title: 'Learn before you change', body: 'Resist the urge to optimize in month one. Understand why the business works before you change how it works.' },
                    ],
                  },
                  {
                    phase: 'Day 30\u201390 \u2014 Optimize',
                    items: [
                      { title: 'Financial controls', body: 'Purchase order systems, approval thresholds, cash flow forecasting. Many acquired businesses have surprisingly loose financial management.' },
                      { title: 'Operational gaps', body: 'The scheduling inefficiency that costs 10 billable hours per week. The quoting process that takes 3 days instead of 3 hours.' },
                      { title: 'Start measuring', body: 'Install the KPIs that matter for your thesis. Growth thesis? Measure pipeline velocity. Margin thesis? Measure labor efficiency.' },
                    ],
                  },
                  {
                    phase: 'Day 90\u2013180 \u2014 Grow',
                    items: [
                      { title: 'Execute the thesis', body: 'The value creation plan built from DD findings, financial model assumptions, and growth thesis \u2014 specific to this business, this market, your goals.' },
                      { title: 'Monthly tracking', body: 'Revenue actual vs. modeled. EBITDA actual vs. modeled. Early warning signals when the thesis isn\u2019t playing out \u2014 and recommendations for course correction.' },
                    ],
                  },
                ].map((phase, i) => (
                  <ScrollReveal key={phase.phase} delay={i * 0.15}>
                    <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                      <div className="flex flex-col items-center shrink-0" style={{ marginLeft: -8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C96B4F', marginTop: 6, boxShadow: '0 0 0 4px rgba(212,113,78,0.15)' }} />
                      </div>
                      <div className="pb-2" style={{ flex: 1 }}>
                        <span style={labelStyle}>
                          {phase.phase}
                          {phase.badge && <PulseBadge style={{ marginLeft: 8 }}>{phase.badge}</PulseBadge>}
                        </span>
                        <div className="space-y-3" style={{ marginTop: 16 }}>
                          {phase.items.map(item => (
                            <div key={item.title} style={cardStyle}>
                              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 6px' }}>{item.title}</h3>
                              <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </AnimatedTimeline>
          </div>
        </div>
      </section>

      {/* ═══ Block 3 — Not Generic ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>INTELLIGENCE CONTINUITY</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Not a template. Your plan.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>When your deal closes, Yulia automatically transitions from the buy journey into the integration journey &mdash; carrying forward everything she learned about this specific business during months of analysis.</p>
              <p>The DD findings, the risk flags, the financial model, the operational gaps, the customer concentration data, the employee assessment, the growth thesis &mdash; all of it feeds directly into a plan built for this business.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>The integration plan isn&apos;t a blog post&apos;s &ldquo;10 things every new owner should do.&rdquo; It&apos;s built from everything Yulia learned during months of analyzing this specific business.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 4 — The Payoff + CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>You own a business. And you know exactly what to do with it.</p>
          </RevealSection>

          <RevealSection>
            <div className="space-y-6" style={bodyStyle}>
              <p>Not &ldquo;now what?&rdquo; Not a generic template. A specific plan for this business, this market, this thesis &mdash; built from months of intelligence.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s the difference between buying a business and building wealth.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about your acquisition &rarr; integration plan in minutes</p>
            <MagneticButton
              onClick={() => onChipClick("I just acquired a business and need an integration plan")}
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
