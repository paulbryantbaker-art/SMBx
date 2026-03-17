import {
  RevealSection,
  ScrollReveal,
  DSCRCalculator,
  MagneticButton,
  AnimatedCounter,
  ConversationPreview,
  PulseBadge,
} from './animations';

interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

const narrowStyle = { maxWidth: 580, margin: '0 auto' } as const;
const wideStyle = { maxWidth: 880, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' } as const;
const h2Style = { fontFamily: "'Inter', system-ui, sans-serif", fontSize: '36px', fontWeight: 800, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 } as const;
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 } as const;
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '40px' } as const;

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. SPEED TO CONVICTION — Conversation Preview ═══ */}
      <section style={{ paddingTop: 100 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              The most expensive mistake isn&apos;t overpaying. It&apos;s time.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center' }}>
              You found a listing at 9pm. Three weeks later: the SDE was inflated, the DSCR didn&apos;t clear, and the right deal went under LOI to someone faster.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <ConversationPreview
              messages={[
                { role: 'user', text: "Dental practice in Austin. $1.6M asking, $480K SDE. Worth pursuing?" },
                { role: 'ai', text: "At $480K SDE, the $1.6M ask implies 3.3\u00D7. Dental practices in Austin trade at 2.8\u00D7\u20133.5\u00D7. Above market.\n\nSBA at 10.25%: DSCR 1.85\u00D7 \u2014 clears. Monthly P&I: $23,800. Annual debt: $285K.\nVerdict: Pursue \u2014 counter at $1.35M\u2013$1.45M." },
              ]}
            />
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. SBA FINANCING — Split Layout ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <div className="flex flex-col md:flex-row gap-12 md:items-start">
            <div style={{ flex: 1 }}>
              <RevealSection>
                <h2 style={{ ...h2Style, marginTop: 0 }} className="md:text-[38px]">
                  Most of what you&apos;ve read about SBA financing is now wrong
                </h2>
                <p style={{ ...bodyStyle, marginTop: 20 }}>
                  The June 2025 SBA rule changes invalidated most deal structures in online guides. Seller notes must sit on full standby for the entire 10-year term. 77% of seller financing structures no longer work.
                </p>
              </RevealSection>
              <RevealSection style={{ marginTop: 24 }}>
                <div className="flex gap-8">
                  {[
                    { value: '77%', label: 'of seller notes restructured' },
                    { value: '10%', label: 'standby minimum' },
                    { value: '41%', label: 'of deals repriced' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '28px', fontWeight: 700, color: '#0D0D0D', margin: 0, lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', margin: '4px 0 0', maxWidth: 100 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </RevealSection>
            </div>

            <ScrollReveal delay={0.1} style={{ flex: 0, minWidth: 300 }}>
              <div style={{ ...cardStyle, padding: '24px 28px' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)', display: 'block', marginBottom: 4 }}>SBA FINANCING MODEL</span>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0D0D', margin: '0 0 16px' }}>Dental Practice &middot; Austin, TX</p>
                {[
                  { label: 'SBA loan (80%)', value: '$1,020,000' },
                  { label: 'Equity (10%)', value: '$160,000' },
                  { label: 'Rate / Term', value: '10.25% · 10yr' },
                  { label: 'Monthly P&I', value: '$13,600' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0D0D0D' }}>{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between" style={{ padding: '10px 0 0' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0D0D0D' }}>DSCR: 1.85×</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#C96B4F' }}>BANKABLE ✓</span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.3)', marginTop: 12 }}>Annual debt: $229,800/yr</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. THE 847 STAT — Market Intelligence ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '96px', fontWeight: 800, color: '#0D0D0D', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
              <AnimatedCounter value={847} />
            </p>
            <p style={{ fontSize: '17px', color: 'rgba(0,0,0,0.45)', marginTop: 12, lineHeight: 1.5 }}>
              HVAC companies in Dallas&ndash;Fort Worth.
            </p>
            <p style={{ ...bodyStyle, marginTop: 20, textAlign: 'center' }}>
              That&apos;s a Census number. But what no listing site tells you is what it means for your deal. Fragmented or saturated? Commercial-growing faster? Are 14 PE platforms driving up multiples?
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <div className="flex justify-center gap-8 md:gap-12">
              {[
                { value: '847', label: 'total businesses' },
                { value: '~12%', label: 'commercial-focused' },
                { value: '14', label: 'active PE platforms' },
                { value: '21%', label: 'median EBITDA margin' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#0D0D0D', margin: 0, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', margin: '6px 0 0', maxWidth: 100 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 4. TAX SHIELD ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              The tax shield most buyers don&apos;t model
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center' }}>
              In an asset purchase, you get a stepped-up basis. A $2M deal yields $200K&ndash;$400K in tax savings over five years. Many buyers pay effectively zero federal income tax in years 3&ndash;5.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ fontSize: '36px', fontWeight: 700, color: '#0D0D0D', margin: 0, letterSpacing: '-0.02em' }}>~$300K total</p>
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: '4px 0 0' }}>Effective tax N.I. 5.5 &ndash;8%</p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 5. NEGOTIATION TERMS — Card Grid ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              The terms that move more money than the price
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: 40 }}>
            {[
              { title: 'Working capital pegs', body: 'Set wrong, these shift $100K+ without changing the headline number. Yulia models the appropriate formulas.' },
              { title: 'Earnouts', body: 'Designed to look generous to the seller while structurally favoring the buyer. Yulia shows the triggers.' },
              { title: 'Indemnification', body: '10-15% escrowed for 12-18 months. Basket and cap structure matters. Yulia models your exposure.' },
              { title: 'Reps & warranties', body: 'Every representation is a contingent liability. Yulia identifies and scores them.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.06}>
                <div style={{ ...cardStyle, height: '100%' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.55, margin: 0 }}>{item.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. THE FULL JOURNEY — 5-Phase Timeline ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              From thesis to close &mdash; and 180 days beyond
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-0" style={{ marginTop: 48, borderTop: '2px solid rgba(0,0,0,0.06)' }}>
            {[
              { phase: 'DEFINE', timing: 'Free', badge: true, body: 'Industry, geography, deal size, SBA eligibility. Investment thesis. Target Templates.' },
              { phase: 'EVALUATE', timing: '', body: 'Financial validation, SBA modeling, market analysis. Pursue or pass.' },
              { phase: 'NEGOTIATE', timing: '', body: 'LOI/term sheet, Tax structure, negotiation intelligence. Structure to maximize.' },
              { phase: 'CLOSE', timing: '', body: 'Organization due work. DD checklist. Red flag scoring. Final requirements.' },
              { phase: '180 DAYS', timing: '', body: 'Stabilize, optimize, execute the value creation roadmap against the model.' },
            ].map((p, i) => (
              <ScrollReveal key={p.phase} delay={i * 0.06}>
                <div style={{ padding: '20px 16px', borderRight: i < 4 ? '1px solid rgba(0,0,0,0.06)' : 'none', height: '100%' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ ...labelStyle, margin: 0, fontSize: '10px' }}>{p.phase}</span>
                    {p.badge && <PulseBadge>FREE</PulseBadge>}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: '10px 0 0' }}>{p.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. BUILT FOR EVERY BUYER — Card Grid ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              Built for every buyer
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 40 }}>
            {[
              { title: 'First-time SBA', body: 'No jargon. Step by step. The same model. Regardless of deal size.' },
              { title: 'Search fund', body: 'More than fund level access. Every target modeled automatically.' },
              { title: 'PE platform', body: '$100M to dry powder, three bolt acquisitions at the time, comparable at scale.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.06}>
                <div style={{ ...cardStyle, height: '100%' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.55, margin: 0 }}>{item.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.2} style={{ marginTop: 16 }}>
            <div style={{ ...cardStyle, borderLeft: '3px solid #C96B4F' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 8px' }}>Strategic acquirer</h3>
              <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.55, margin: 0 }}>Roll-up strategy, synergies, integration complexity, new market modeling before close.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 8. CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '40px', fontWeight: 800, color: '#0D0D0D', lineHeight: 1.15, letterSpacing: '-0.035em', margin: 0 }} className="md:text-[48px]">
              You own a business now.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20, textAlign: 'center' }}>
              The deal was validated. The structure was optimized. The risks were identified. The thesis is tracked.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 32, textAlign: 'center' }}>
            <MagneticButton
              onClick={() => onChipClick("I'm looking to buy a business")}
              style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Tell Yulia what you&apos;re looking for
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
