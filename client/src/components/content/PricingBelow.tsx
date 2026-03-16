import {
  RevealSection,
  ScrollReveal,
  MagneticButton,
  ConversationPreview,
  ExpandableCard,
} from './animations';

interface PricingBelowProps {
  onChipClick: (text: string) => void;
}

const narrowStyle = { maxWidth: 580, margin: '0 auto' } as const;
const wideStyle = { maxWidth: 880, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' } as const;
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 } as const;
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 } as const;
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' } as const;

export default function PricingBelow({ onChipClick }: PricingBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. ALWAYS FREE — Grid ═══ */}
      <section style={{ paddingTop: 100 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <span style={labelStyle}>ALWAYS FREE</span>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginTop: 32 }}>
            {[
              { title: 'Bizestimate', body: 'Market value range. Census, BLS, SBA data. Shareable.' },
              { title: 'Value Readiness', body: 'Seven-factor score with dollar impact of each improvement.' },
              { title: 'Investment Thesis', body: 'Acquisition blueprint. Criteria, capital stack, SBA eligibility.' },
              { title: 'SDE/EBITDA', body: 'Complete add-back identification. Adjusted earnings.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.06}>
                <div style={{ ...cardStyle, height: '100%', padding: '20px 24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 6px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{item.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <RevealSection style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{ ...cardStyle, display: 'inline-block', padding: '16px 24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 4px' }}>Capital Stack</h3>
              <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.4, margin: 0 }}>SBA loan, equity, seller note, monthly debt service.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.35)', margin: 0, fontStyle: 'italic' }}>
              Not teasers. Complete analyses from a conversation.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. YOUR DEAL DETERMINES YOUR PRICE — 3 Tier Cards ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              Your deal determines your price.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 12, textAlign: 'center' }}>
              You don&apos;t pick a plan. You tell Yulia about your deal.
            </p>
          </RevealSection>

          <div className="flex flex-col md:flex-row gap-5" style={{ marginTop: 48 }}>
            {/* $49 */}
            <ScrollReveal delay={0} style={{ flex: 1 }}>
              <div style={{ ...cardStyle, height: '100%', borderColor: 'rgba(0,0,0,0.08)' }}>
                <p style={{ fontSize: '40px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 2px', letterSpacing: '-0.03em', lineHeight: 1 }}>$49</p>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: '0 0 16px' }}>/month</p>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.55, margin: '0 0 20px' }}>
                  Owner-operated deals &mdash; clear process, trustworthy analysis, every step guided.
                </p>
                <div className="space-y-2">
                  {['Full journeys (Sell, Buy, Raise, Integrate)', 'SDE normalization', 'SBA financing at live rates', 'Market intelligence by MSA', 'LOI drafting + negotiation intel', 'Deal data room'].map(t => (
                    <p key={t} style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.3)', marginTop: 20, margin: '20px 0 0' }}>7-day free trial &middot; Cancel anytime</p>
              </div>
            </ScrollReveal>

            {/* $199 — Featured */}
            <ScrollReveal delay={0.08} style={{ flex: 1 }}>
              <div style={{ borderRadius: 16, border: '2px solid #C96B4F', padding: '28px 32px', height: '100%', background: '#FFFFFF' }}>
                <p style={{ fontSize: '40px', fontWeight: 700, color: '#C96B4F', margin: '0 0 2px', letterSpacing: '-0.03em', lineHeight: 1 }}>$199</p>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: '0 0 16px' }}>/month</p>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.55, margin: '0 0 20px' }}>
                  Mid-market deals &mdash; institutional-quality analysis at a fraction of boutique advisory.
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#C96B4F', margin: '0 0 8px' }}>Everything in $49, plus:</p>
                <div className="space-y-2">
                  {['EBITDA normalization', 'Living CIM with auto-updates', 'Quality of Earnings analysis', 'Three-statement financial model', 'Tax structure analysis', 'PE buyer mapping'].map(t => (
                    <p key={t} style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.3)', marginTop: 20, margin: '20px 0 0' }}>7-day free trial &middot; Cancel anytime</p>
              </div>
            </ScrollReveal>

            {/* $499 */}
            <ScrollReveal delay={0.16} style={{ flex: 1 }}>
              <div style={{ ...cardStyle, height: '100%', borderColor: 'rgba(0,0,0,0.08)' }}>
                <p style={{ fontSize: '40px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 2px', letterSpacing: '-0.03em', lineHeight: 1 }}>$499</p>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: '0 0 16px' }}>/month</p>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.55, margin: '0 0 20px' }}>
                  Institutional transactions &mdash; board-level deliverables calibrated to PE expectations.
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.5)', margin: '0 0 8px' }}>Everything in $199, plus:</p>
                <div className="space-y-2">
                  {['DCF modeling', 'IRR/MOIC projections', 'LBO scenarios', 'Cap table with waterfall', '180-day PMI auto-build', 'Covenant analysis'].map(t => (
                    <p key={t} style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.3)', marginTop: 20, margin: '20px 0 0' }}>7-day free trial &middot; Cancel anytime</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. DEAL REVEALS — Conversation Preview ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              You don&apos;t pick a plan. Your deal reveals it.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <ConversationPreview
              messages={[
                { role: 'user', text: "I want to sell my HVAC company in Dallas. About $4.2M revenue, $780K EBITDA." },
                { role: 'ai', text: "Based on your financials, your plan includes full valuation, SBA model, market intelligence, CIM, buyer targeting, negotiation strategy, and closing preparation.\n$49/month." },
              ]}
            />
          </RevealSection>

          <RevealSection style={{ marginTop: 12, textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', margin: 0 }}>
              But first &mdash; let&apos;s see what the business is worth.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 4. QUESTIONS ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, textAlign: 'center' }}>Questions</h2>
          </RevealSection>

          <div className="space-y-0" style={{ marginTop: 32 }}>
            {[
              { q: '"Really free?"', a: 'No catch. No card. No auto-conversion. Sovereign data, synthesized in seconds.' },
              { q: '"Why does pricing vary?"', a: 'A $500K landscaping company and a $15M manufacturer need fundamentally different analysis. The price reflects depth, not markup.' },
              { q: '"Different from ChatGPT?"', a: 'ChatGPT knows about deals. Yulia knows yours. Every number sourced. Every analysis localized. Documents your bank or attorney can use.' },
              { q: '"Working with a broker?"', a: 'Even better. Show up with the analysis done.' },
              { q: '"Cancel?"', a: 'Anytime. No contracts. Your data is yours.' },
            ].map(item => (
              <RevealSection key={item.q}>
                <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 6px' }}>{item.q}</h3>
                  <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.55, margin: 0 }}>{item.a}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. FOR ADVISORS ═══ */}
      <section style={{ paddingTop: 80 }}>
        <div style={wideStyle}>
          <RevealSection>
            <div style={{ background: '#FAFAFA', borderRadius: 16, padding: '40px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 12px', letterSpacing: '-0.02em' }}>For advisors</h3>
              <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.6, margin: 0, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                First three client journeys free. After that, pricing follows the deal. White-labeled deliverables under your brand. No per-seat licensing.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 6. FINAL CTA ═══ */}
      <section style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.5)', marginBottom: 16 }}>Start a free analysis &rarr; see what Yulia delivers before you pay anything</p>
            <MagneticButton
              onClick={() => onChipClick("Start a free analysis")}
              style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Start chatting
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
