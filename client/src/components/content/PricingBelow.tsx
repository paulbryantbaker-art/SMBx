import { useState } from 'react';
import {
  RevealSection,
  StaggerContainer,
  StaggerItem,
  MagneticButton,
  PulseBadge,
  ConversationPreview,
  ExpandableCard,
} from './animations';

interface PricingBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '24px 28px' };

export default function PricingBelow({ onChipClick }: PricingBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ Block 1 — Free forever ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>START FREE</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Start free. Stay because it works.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Before Yulia ever mentions a plan, she&apos;s already delivered the foundational analysis for your deal. No credit card. No trial. Free forever.
            </p>
          </RevealSection>

          <div className="space-y-4" style={{ marginTop: 40 }}>
            {[
              { title: 'Bizestimate', body: 'Your business valuation range \u2014 updated quarterly. Shareable link for partners, CPAs, attorneys.' },
              { title: 'Value Readiness Report', body: '7-factor score with specific improvement actions and dollar-impact estimates.' },
              { title: 'Investment Thesis Document', body: 'Acquisition blueprint with criteria, SBA eligibility, capital stack template, and market landscape.' },
              { title: 'Preliminary SDE / EBITDA', body: 'Add-back math and adjusted earnings calculation \u2014 the foundation everything else is built on.' },
              { title: 'Capital Stack Template', body: 'Exactly how a business at your target price would be financed: SBA loan, equity injection, seller note, monthly debt service.' },
              { title: 'Unlimited Conversation', body: 'Talk to Yulia about deal classification, SBA screening, process guidance, exit options, tax structure modeling, and more.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <div style={cardStyle}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0D0D0D', margin: '0 0 6px' }}>{item.title}</h3>
                    <PulseBadge color="#C96B4F">Free</PulseBadge>
                  </div>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.body}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 2 — Three tiers ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>ONE CONVERSATION &middot; THE RIGHT PLAN</span>
            <h2 style={h2Style} className="md:text-[48px]">
              One conversation. The right plan for your deal.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Yulia learns about your deal during your free conversation. When you&apos;re ready for deeper analysis, she surfaces the plan that fits &mdash; no upsell, no sales call.
            </p>
          </RevealSection>

          <StaggerContainer className="space-y-4" style={{ marginTop: 40 }}>
            {[
              {
                name: 'Starter',
                price: '$49',
                period: '/month',
                badge: null,
                items: [
                  'Business Valuation Report',
                  'Market Intelligence Report',
                  'Deal Screening Memo',
                  'SBA Financing Model',
                  'Sector Analysis',
                ],
                note: 'Know your position. Validate the deal.',
              },
              {
                name: 'Professional',
                price: '$199',
                period: '/month',
                badge: 'Most popular',
                items: [
                  'Everything in Starter, plus:',
                  'Confidential Information Memo (CIM)',
                  'Full Valuation Suite',
                  'QoE Lite',
                  'Tax Structure Analysis',
                  'Term Sheet Generator',
                  'Financial Model',
                ],
                note: 'Prepare to transact. Institutional-grade documents.',
              },
              {
                name: 'Enterprise',
                price: '$499',
                period: '/month',
                badge: null,
                items: [
                  'Everything in Professional, plus:',
                  'Living CIM (auto-updates)',
                  'LBO Model',
                  'Due Diligence Package',
                  'Negotiation Strategy',
                  'Integration Plan',
                  'Priority support',
                ],
                note: 'Close the deal. Full transaction support.',
              },
            ].map(tier => (
              <StaggerItem key={tier.name}>
                <div style={{
                  ...cardStyle,
                  borderLeft: tier.badge ? '3px solid #C96B4F' : undefined,
                }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0D0D0D', margin: 0 }}>{tier.name}</h3>
                    {tier.badge && <PulseBadge color="#C96B4F">{tier.badge}</PulseBadge>}
                  </div>
                  <div className="flex items-baseline gap-1" style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: '36px', fontWeight: 700, color: '#C96B4F', lineHeight: 1 }}>{tier.price}</span>
                    <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)' }}>{tier.period}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', fontStyle: 'italic', margin: '0 0 16px' }}>{tier.note}</p>
                  <div className="space-y-2">
                    {tier.items.map(item => (
                      <div key={item} className="flex items-start gap-2">
                        <span style={{ color: '#C96B4F', fontSize: '14px', lineHeight: '1.5', flexShrink: 0 }}>&#10003;</span>
                        <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ Block 3 — How Discovery Works ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>HOW DISCOVERY WORKS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              One conversation surfaces the right plan.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Yulia doesn&apos;t show you a pricing page. She learns about your deal and suggests the plan that fits.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <ConversationPreview
              messages={[
                { role: 'user', text: "I want to sell my HVAC company in Dallas. About $4.2M revenue, $780K EBITDA." },
                { role: 'ai', text: "Based on your financials and market, your Bizestimate range is $3.7M\u2013$4.8M. I\u2019ve generated your free Value Readiness Report \u2014 your biggest optimization opportunity is EBITDA margin improvement. When you\u2019re ready for the full valuation and CIM, the Starter plan covers both." },
                { role: 'user', text: "What do I get on the Starter plan?" },
                { role: 'ai', text: "Starter ($49/mo) includes your full Valuation Report, Market Intelligence, SBA Financing Model, and Deal Screening Memo. Everything you need to know your position before going to market." },
              ]}
            />
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 4 — For Advisors ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <div style={{ ...cardStyle, padding: '32px' }}>
              <span style={{ ...labelStyle, display: 'block', marginBottom: 16 }}>FOR ADVISORS AND BROKERS</span>
              <h3 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 16 }} className="md:text-[36px]">
                Your first 3 client journeys are free.
              </h3>
              <div className="space-y-4" style={bodyStyle}>
                <p>White-label everything. Your clients see your deliverables, your brand, your expertise. Yulia generates the CIM, runs the valuation, models the tax structure.</p>
                <p>After three journeys, pick the plan that fits your practice.</p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ Block 5 — Common questions ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>COMMON QUESTIONS</span>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 32 }}>
            {[
              { q: 'Is the free analysis really free?', a: 'No catch. No credit card. No trial that auto-converts. The free tier is free forever. You get your Bizestimate, Value Readiness Report, and unlimited conversation before we ever mention a plan.' },
              { q: 'How is this different from ChatGPT?', a: 'ChatGPT generates plausible text about M&A concepts. Yulia analyzes your specific deal against real federal data \u2014 Census, BLS, FRED, SEC EDGAR, SBA \u2014 with a structured methodology calibrated to your industry, geography, and deal size.' },
              { q: 'Can I switch plans?', a: 'Yes. Upgrade, downgrade, or cancel anytime. Your data and conversation history stay with you. If your deal closes, you can pause until the next one.' },
              { q: 'What if my deal is complex?', a: 'The platform adapts to deal complexity. Larger deals receive deeper analysis and more sophisticated financial modeling \u2014 same methodology, scaled to the deal.' },
              { q: 'Can I use this with my broker or advisor?', a: 'Absolutely. Most professionals appreciate clients who arrive prepared. Bring your smbX.ai analysis to your first meeting. Your advisor handles relationships and negotiation. Yulia handles the data.' },
              { q: 'What happens when I cancel?', a: 'You keep access to all deliverables you\u2019ve generated. Your conversation history is preserved. You can resubscribe whenever you\u2019re ready for the next deal.' },
            ].map(item => (
              <ExpandableCard key={item.q} title={item.q}>
                <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.a}</p>
              </ExpandableCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 6 — CTA ═══ */}
      <section style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#0D0D0D', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>Intelligence you can afford. Results you can defend.</p>
          </RevealSection>

          <RevealSection>
            <div className="text-center">
              <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.5)', marginBottom: 16 }}>Start a free analysis &rarr; see what Yulia delivers before you pay anything</p>
              <MagneticButton
                onClick={() => onChipClick("Start a free analysis")}
                style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
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
