import {
  RevealSection,
  ScrollReveal,
  InteractiveCalculator,
  AnimatedTimeline,
  MagneticButton,
  PulseBadge,
  AnimatedCounter,
  DealPreview,
  SideBySideCard,
  ConversationPreview,
} from './animations';

interface SellBelowProps {
  onChipClick: (text: string) => void;
}

const narrowStyle = { maxWidth: 580, margin: '0 auto' } as const;
const wideStyle = { maxWidth: 880, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' } as const;
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 } as const;
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 } as const;
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' } as const;

export default function SellBelow({ onChipClick }: SellBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. THE 75% STAT ═══ */}
      <section style={{ paddingTop: 100, textAlign: 'center' }}>
        <div style={narrowStyle}>
          <RevealSection>
            <p style={{ fontSize: '96px', fontWeight: 700, color: '#0D0D0D', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
              <AnimatedCounter value={75} style={{ color: '#0D0D0D' }} />%
            </p>
            <p style={{ fontSize: '17px', color: 'rgba(0,0,0,0.45)', marginTop: 16, lineHeight: 1.6 }}>
              of business owners regret selling within a year.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <div className="space-y-5" style={{ ...bodyStyle, textAlign: 'left' }}>
              <p style={{ color: '#0D0D0D', fontWeight: 600 }}>Not because the price was wrong.</p>
              <p>The Exit Planning Institute found the same three regrets: They weren&apos;t financially prepared. They didn&apos;t have a plan for after. And the buyer dismantled what they&apos;d built.</p>
              <p>Only 20&ndash;30% of businesses that go to market actually sell. Most fail because the owner wasn&apos;t ready &mdash; financially, operationally, or psychologically &mdash; for a process that takes 12 to 24 months.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. BIZESTIMATE — Split Layout ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <div className="flex flex-col md:flex-row gap-12 md:items-start">
            <div style={{ flex: 1 }}>
              <RevealSection>
                <h2 style={{ ...h2Style, marginTop: 0 }} className="md:text-[42px]">
                  What your business is actually worth &mdash; right now
                </h2>
                <div className="space-y-5" style={{ ...bodyStyle, marginTop: 24 }}>
                  <p>Tell Yulia your industry, location, and revenue. Within seconds, she&apos;ll give you a Bizestimate &mdash; a valuation range built on Census business counts, BLS wage data, SBA lending patterns, and real transaction multiples.</p>
                  <p style={{ color: '#0D0D0D', fontWeight: 600 }}>Free, always. Because this is how trust starts.</p>
                </div>
              </RevealSection>
            </div>

            <ScrollReveal delay={0.1} style={{ flex: 0, minWidth: 300 }}>
              <DealPreview
                title="BIZESTIMATE \u2014 EXAMPLE"
                metrics={[
                  { label: 'Adjusted SDE', value: '$444K' },
                  { label: 'Multiple range', value: '2.8\u20133.5\u00D7' },
                  { label: 'Value range', value: '$1.08M\u2013$1.89M' },
                  { label: 'Data sources', value: '5 federal' },
                ]}
                cta="Generated in 90 seconds from industry, location, and revenue"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. THE HIDDEN MONEY — Add-backs ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              The $400,000 hiding in your tax returns
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              Your CPA minimizes what you owe the IRS. The problem shows up the day you try to sell &mdash; because buyers pay based on Seller&apos;s Discretionary Earnings, not taxable income.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <InteractiveCalculator
              baseSDE={320000}
              multiple={3.2}
              items={[
                { label: 'Personal vehicles', amount: 48000, enabled: true },
                { label: 'Family cell phones', amount: 18000, enabled: true },
                { label: 'One-time legal fee', amount: 12000, enabled: true },
                { label: 'Above-market rent to own LLC', amount: 31000, enabled: true },
                { label: 'Personal travel', amount: 15000, enabled: true },
              ]}
            />
            <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.35)', marginTop: 12, fontStyle: 'italic', textAlign: 'center' }}>
              Toggle add-backs on/off to see the impact on your valuation
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 4. THE TAX BLINDSPOT — Structure ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              The deal structure that costs more than the negotiation
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              A C Corp owner closed a $2.8M deal. Double-taxed cost her $200K+. Her attorney and CPA knew the risk. Neither raised it until the purchase agreement was drafted.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <SideBySideCard
              leftLabel="ASSET SALE"
              rightLabel="STOCK SALE"
              leftItems={[
                { label: 'Purchase price', value: '$2,000,000' },
                { label: 'Federal + NIIT', value: '~$518K' },
                { label: 'State tax (CA)', value: '~$266K' },
                { label: 'Net to seller', value: '$1,166,000' },
              ]}
              rightItems={[
                { label: 'Purchase price', value: '$2,000,000' },
                { label: 'Federal + NIIT', value: '~$452K' },
                { label: 'State tax (CA)', value: '~$253K' },
                { label: 'Net to seller', value: '$1,245,000' },
              ]}
            />
          </RevealSection>
        </div>
      </section>

      {/* ═══ 5. SIX WAYS OUT — Card Grid ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              Six ways out
            </h2>
            <p style={{ ...bodyStyle, marginTop: 8, textAlign: 'center' }}>And only one is right for you.</p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 40 }}>
            {[
              { title: 'Full Sale', body: '100% exit. Maximum price, 5-15% holdback. The complete exit process managed by Yulia.' },
              { title: 'Partner Buyout', body: 'One partner exits. Fair value, financing that works, a buyout agreement that protects everyone.' },
              { title: 'Capital Raise', body: 'Maybe you don\u2019t want to exit. Get $600K from your own business via SBA, equity, or seller installments.' },
              { title: 'ESOP', body: 'Employee ownership. Section 1042 tax deferral. Yulia screens eligibility and models the structure.' },
              { title: 'Majority Sale', body: 'Sell 51%+ to PE. Take chips off. Keep upside with equity rollover and earnout.' },
              { title: 'Partial Sale', body: 'Sell a division, a location, or a book of business. Keep what matters.' },
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

      {/* ═══ 6. THE LIVING CIM ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              A CIM that never goes stale
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center' }}>
              Yulia&apos;s Living CIM updates automatically when your financials change. Version-controlled. Tiered buyer access. Every time, market data current. Generated in 30 minutes from months of intelligence. Included in your plan.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <div className="flex justify-center gap-12">
              {[
                { value: 25, suffix: '+', label: 'pages' },
                { value: 30, suffix: '', label: 'minutes' },
                { value: 3, suffix: '', label: 'versions/quarter' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '40px', fontWeight: 700, color: '#0D0D0D', margin: 0, letterSpacing: '-0.03em' }}>
                    <AnimatedCounter value={stat.value} />{stat.suffix}
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)', margin: '4px 0 0' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 7. THE PROCESS — 4-phase timeline ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              The complete process
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-0" style={{ marginTop: 48, borderTop: '2px solid rgba(0,0,0,0.06)' }}>
            {[
              { phase: 'UNDERSTAND', timing: 'Month 1\u20132', badge: 'FREE', body: 'Bizestimate, value readiness, SDE/EBITDA, preliminary valuation range. See your business through a buyer\u2019s eyes.' },
              { phase: 'OPTIMIZE', timing: 'Month 3\u201312', body: 'A $50K improvement in EBITDA at 5\u00D7 adds $250K. Yulia builds a prioritized optimization plan: margins, revenue, management depth.' },
              { phase: 'PREPARE', timing: 'Month 6\u201318', body: 'Living CIM. Financial exhibits. Blind teaser. Buyer targeting. Data room. Everything a qualified buyer needs.' },
              { phase: 'NEGOTIATE & CLOSE', timing: 'Month 12\u201324', body: 'LOI evaluation. Deal structure modeling. Earnout analysis. Working capital. Real negotiation tactics.' },
            ].map((p, i) => (
              <ScrollReveal key={p.phase} delay={i * 0.08}>
                <div style={{ padding: '24px 20px', borderRight: i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none', height: '100%' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                    <span style={{ ...labelStyle, margin: 0 }}>{p.phase}</span>
                    {p.badge && <PulseBadge style={{ marginLeft: 4 }}>{p.badge}</PulseBadge>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.35)', margin: '0 0 12px' }}>{p.timing}</p>
                  <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.55, margin: 0 }}>{p.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. THREE DEAL-KILLERS ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              Three things that kill more deals than price
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 40 }}>
            {[
              { num: '01', title: 'The lease.', body: 'Landlord consent is required for assignment. If the business depends on a location, a hostile or slow landlord can kill a deal in months.' },
              { num: '02', title: 'The licenses.', body: 'Liquor, DOT, HIPAA, healthcare certifications. Transfer timelines range from 60 days to 6 months. Start early.' },
              { num: '03', title: 'Reps and warranties.', body: 'Every representation is a guarantee. If it turns out false, the buyer can claw back money through indemnification. Know your exposure before signing.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div style={{ ...cardStyle, height: '100%' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(0,0,0,0.2)', display: 'block', marginBottom: 8 }}>{item.num}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 10px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.55, margin: 0 }}>{item.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. BROKER PARTNERSHIP ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              Working with a broker? Even better.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20, textAlign: 'center' }}>
              Show up to your first meeting with normalized financials, a defensible valuation, market intelligence, a draft CIM structure, and a Value Readiness Report. Your broker handles relationships. Yulia handles data.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 10. YOUR DEAL, YOUR DEPTH — 3 League Cards ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              Your deal, your depth
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 40 }}>
            {[
              { label: '$300K\u2013$2M SDE', title: 'Owner-Operated', items: ['Step-by-step, SDE-focused, plain language', 'SBA financing at live rates', 'Matched to a process your first time'] },
              { label: '$2M\u2013$10M EBITDA', title: 'Established', items: ['Institutional process. PE buyer mapping.', 'Working capital. Term sheet. EBITDA metrics.', 'CIM that reads like boutique advisory.'] },
              { label: '$10M+ EBITDA', title: 'Institutional', items: ['Board-level deliverables. DCF modeling.', 'Covenant analysis, leverage scenarios.', 'Strategic acquirer identification.'] },
            ].map((tier, i) => (
              <ScrollReveal key={tier.title} delay={i * 0.08}>
                <div style={{ ...cardStyle, height: '100%' }}>
                  <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)' }}>{tier.label}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D0D0D', margin: '10px 0 14px' }}>{tier.title}</h3>
                  <div className="space-y-2">
                    {tier.items.map(t => (
                      <p key={t} style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 11. THE WIRE HITS — CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#0D0D0D', lineHeight: 1.15, letterSpacing: '-0.035em', margin: 0 }} className="md:text-[48px]">
              The wire hits.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20, textAlign: 'center' }}>
              Not &ldquo;I hope I got a fair deal.&rdquo; You know your number was real. Your add-backs were captured. The structure was optimized. The CIM was institutional-quality.
            </p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0D0D0D', marginTop: 20 }}>
              That&apos;s what preparation delivers. Not hope. Certainty.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 32, textAlign: 'center' }}>
            <MagneticButton
              onClick={() => onChipClick("I want to sell my business")}
              style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Tell Yulia about your business
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
