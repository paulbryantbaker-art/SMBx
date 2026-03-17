import { RevealSection, ScrollReveal } from './animations';

/* ─── Inline SVG icons ─── */
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 13.475L4.025 10L2.842 11.175L7.5 15.833L17.5 5.833L16.325 4.658L7.5 13.475Z" fill="#ec5b13" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="#ec5b13" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#ec5b13" />
  </svg>
);

const PublicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z" fill="#ec5b13" />
  </svg>
);

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
  </svg>
);

const SmartToyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 9V7C20 5.9 19.1 5 18 5H13V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V5H6C4.9 5 4 5.9 4 7V9C2.9 9 2 9.9 2 11V13C2 14.1 2.9 15 4 15V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V15C21.1 15 22 14.1 22 13V11C22 9.9 21.1 9 20 9ZM9.5 13.5C8.67 13.5 8 12.83 8 12C8 11.17 8.67 10.5 9.5 10.5C10.33 10.5 11 11.17 11 12C11 12.83 10.33 13.5 9.5 13.5ZM14.5 13.5C13.67 13.5 13 12.83 13 12C13 11.17 13.67 10.5 14.5 10.5C15.33 10.5 16 11.17 16 12C16 12.83 15.33 13.5 14.5 13.5Z" fill="#ec5b13" />
  </svg>
);

const FONT = "'Inter', system-ui, sans-serif";
const ORANGE = '#ec5b13';

export default function PricingBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div style={{ fontFamily: FONT }}>

      {/* ═══════════════════════════════════════════════════
          1. HERO — "Start free. Scale with precision."
          ═══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 64px' }}>
        <RevealSection style={{ textAlign: 'center' }}>
          <h1 style={{
            maxWidth: 900,
            margin: '0 auto',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            color: '#0f172a',
            fontFamily: FONT,
          }}>
            Start free. <span style={{ color: ORANGE }}>Scale with precision.</span>
          </h1>
          <p style={{
            maxWidth: 672,
            margin: '32px auto 0',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            fontWeight: 400,
            lineHeight: 1.65,
            color: '#475569',
            fontFamily: FONT,
          }}>
            Get your free Bizestimate and Value Readiness score in minutes. No credit card required.
            Our platform evolves with your business from garage start-up to enterprise exit.
          </p>
          <div className="flex flex-col sm:flex-row" style={{
            marginTop: 48,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
          }}>
            <button
              onClick={() => onChipClick('Get my free Bizestimate score')}
              style={{
                width: '100%',
                maxWidth: 280,
                borderRadius: 12,
                backgroundColor: ORANGE,
                padding: '16px 32px',
                fontSize: 18,
                fontWeight: 700,
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 20px 25px -5px rgba(236, 91, 19, 0.3)',
                fontFamily: FONT,
              }}
            >
              Get Your Free Score
            </button>
            <button
              onClick={() => onChipClick('Show me a sample Bizestimate report')}
              style={{
                width: '100%',
                maxWidth: 280,
                borderRadius: 12,
                backgroundColor: '#ffffff',
                padding: '16px 32px',
                fontSize: 18,
                fontWeight: 700,
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                fontFamily: FONT,
              }}
            >
              View Sample Report
            </button>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. FREE DELIVERABLES — 3 cards
          ═══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#ffffff', padding: '96px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 32 }}>
            {[
              {
                icon: <TrendingUpIcon />,
                title: 'Bizestimate\u2122',
                body: 'Real-time valuation based on live market data, proprietary algorithms, and recent industry transactions.',
              },
              {
                icon: <CheckCircleIcon />,
                title: 'Value Readiness',
                body: 'Identify operational gaps and unlock hidden equity with our comprehensive readiness assessment score.',
              },
              {
                icon: <PublicIcon />,
                title: 'Market Insights',
                body: 'Compare your performance against local and global industry benchmarks to see exactly where you stand.',
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.08}>
                <div style={{
                  borderRadius: 16,
                  border: '1px solid #f1f5f9',
                  backgroundColor: 'rgba(248, 250, 252, 0.5)',
                  padding: 32,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'rgba(236, 91, 19, 0.5)';
                    el.style.backgroundColor = '#ffffff';
                    el.style.boxShadow = '0 25px 50px -12px rgba(236, 91, 19, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = '#f1f5f9';
                    el.style.backgroundColor = 'rgba(248, 250, 252, 0.5)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    marginBottom: 24,
                    display: 'flex',
                    height: 48,
                    width: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: 'rgba(236, 91, 19, 0.1)',
                  }}>
                    {card.icon}
                  </div>
                  <h3 style={{
                    marginBottom: 12,
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#0f172a',
                    fontFamily: FONT,
                  }}>
                    {card.title}
                  </h3>
                  <p style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: '#475569',
                    margin: 0,
                    fontFamily: FONT,
                  }}>
                    {card.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          3. PRICING GRID — 3 plans
          ═══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px' }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: '#0f172a',
            margin: 0,
            fontFamily: FONT,
          }}>
            Choose your growth path
          </h2>
          <p style={{
            marginTop: 16,
            fontSize: 16,
            color: '#475569',
            fontFamily: FONT,
          }}>
            Simple, transparent pricing for every stage of your business journey.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 32 }}>

          {/* ── Essential Plan ── */}
          <ScrollReveal delay={0}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 24,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              padding: 32,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              height: '100%',
            }}>
              <div style={{ marginBottom: 32 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: FONT,
                }}>
                  Essential
                </h3>
                <div className="flex" style={{ marginTop: 16, alignItems: 'baseline', gap: 4 }}>
                  <span style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1,
                    fontFamily: FONT,
                  }}>
                    $49
                  </span>
                  <span style={{ color: '#64748b', fontFamily: FONT }}>/mo</span>
                </div>
                <p style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: '#475569',
                  lineHeight: 1.6,
                  fontFamily: FONT,
                }}>
                  Perfect for solo founders looking to understand their market value.
                </p>
              </div>
              <button
                onClick={() => onChipClick('I want to start the Essential plan at $49/mo')}
                style={{
                  marginBottom: 32,
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  border: `1px solid ${ORANGE}`,
                  backgroundColor: 'transparent',
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: ORANGE,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: FONT,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = ORANGE;
                  el.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = 'transparent';
                  el.style.color = ORANGE;
                }}
              >
                Start Essential
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  'Basic Market Analytics',
                  '1 Admin User',
                  'Monthly Bizestimate Update',
                  'Email Support',
                  'Standard Valuation Reports',
                ].map((item) => (
                  <div key={item} className="flex" style={{ alignItems: 'flex-start', gap: 12 }}>
                    <CheckIcon />
                    <span style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#334155',
                      fontFamily: FONT,
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── Growth Plan (Featured) ── */}
          <ScrollReveal delay={0.08}>
            <div style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 24,
              border: `2px solid ${ORANGE}`,
              backgroundColor: '#ffffff',
              padding: 32,
              boxShadow: `0 25px 50px -12px rgba(236, 91, 19, 0.1)`,
              height: '100%',
            }}>
              <div style={{
                position: 'absolute',
                top: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: 9999,
                backgroundColor: ORANGE,
                padding: '4px 16px',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                color: '#ffffff',
                whiteSpace: 'nowrap' as const,
                fontFamily: FONT,
              }}>
                Most Popular
              </div>
              <div style={{ marginBottom: 32 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: FONT,
                }}>
                  Growth
                </h3>
                <div className="flex" style={{ marginTop: 16, alignItems: 'baseline', gap: 4 }}>
                  <span style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1,
                    fontFamily: FONT,
                  }}>
                    $199
                  </span>
                  <span style={{ color: '#64748b', fontFamily: FONT }}>/mo</span>
                </div>
                <p style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: '#475569',
                  lineHeight: 1.6,
                  fontFamily: FONT,
                }}>
                  Comprehensive tools for teams focused on aggressive value optimization.
                </p>
              </div>
              <button
                onClick={() => onChipClick('I want to start the Growth plan at $199/mo')}
                style={{
                  marginBottom: 32,
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: ORANGE,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(236, 91, 19, 0.3)',
                  transition: 'transform 0.2s ease',
                  fontFamily: FONT,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Go Growth
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  'Advanced Predictive Analytics',
                  'Up to 5 Team Members',
                  'Priority Support Desk',
                  'Custom KPI Dashboards',
                  'Value Optimization Playbook',
                  'Quarterly Strategic Review',
                ].map((item) => (
                  <div key={item} className="flex" style={{ alignItems: 'flex-start', gap: 12 }}>
                    <CheckIcon />
                    <span style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#334155',
                      fontFamily: FONT,
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── Enterprise Plan ── */}
          <ScrollReveal delay={0.16}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 24,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              padding: 32,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              height: '100%',
            }}>
              <div style={{ marginBottom: 32 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: FONT,
                }}>
                  Enterprise
                </h3>
                <div className="flex" style={{ marginTop: 16, alignItems: 'baseline', gap: 4 }}>
                  <span style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1,
                    fontFamily: FONT,
                  }}>
                    $499
                  </span>
                  <span style={{ color: '#64748b', fontFamily: FONT }}>/mo</span>
                </div>
                <p style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: '#475569',
                  lineHeight: 1.6,
                  fontFamily: FONT,
                }}>
                  Total control and bespoke support for high-volume organizations.
                </p>
              </div>
              <button
                onClick={() => onChipClick('I want to learn about the Enterprise plan')}
                style={{
                  marginBottom: 32,
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  border: '1px solid #0f172a',
                  backgroundColor: '#0f172a',
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontFamily: FONT,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                }}
              >
                Contact Sales
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  'Unlimited Multi-Org Users',
                  'Full White-labeling Options',
                  'Direct API & Webhook Access',
                  'Dedicated M&A Advisor',
                  'Full Narrative Support',
                  'Custom Integration Builds',
                ].map((item) => (
                  <div key={item} className="flex" style={{ alignItems: 'flex-start', gap: 12 }}>
                    <CheckIcon />
                    <span style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#334155',
                      fontFamily: FONT,
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          4. CONVERSATION EXAMPLE — Dark section
          ═══════════════════════════════════════════════════ */}
      <section style={{
        backgroundColor: '#0f172a',
        padding: '96px 0',
        color: '#ffffff',
      }}>
        <div style={{
          maxWidth: 1024,
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center',
        }}>
          <RevealSection>
            <h2 style={{
              marginBottom: 48,
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              fontFamily: FONT,
            }}>
              Experience the precision of smbx.ai
            </h2>
          </RevealSection>

          <ScrollReveal>
            <div style={{
              maxWidth: 672,
              margin: '0 auto',
              overflow: 'hidden',
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: 4,
              textAlign: 'left',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                padding: 32,
              }}>
                {/* User message */}
                <div className="flex" style={{ alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    display: 'flex',
                    height: 40,
                    width: 40,
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: ORANGE,
                  }}>
                    <PersonIcon />
                  </div>
                  <div style={{
                    borderRadius: 16,
                    borderTopLeftRadius: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: 16,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: '#f1f5f9',
                    fontFamily: FONT,
                  }}>
                    "I have a recurring revenue SaaS company doing $2M ARR with 85% margins. What's my Bizestimate?"
                  </div>
                </div>

                {/* AI response */}
                <div className="flex" style={{ alignItems: 'flex-start', justifyContent: 'flex-end', gap: 16 }}>
                  <div style={{
                    borderRadius: 16,
                    borderTopRightRadius: 0,
                    backgroundColor: ORANGE,
                    padding: 16,
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.65,
                    color: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(236, 91, 19, 0.2)',
                    fontFamily: FONT,
                  }}>
                    "Based on current multiples in your niche, your Bizestimate is approximately $12.4M. To increase this to $15M+, we recommend focusing on reducing churn by 2%."
                  </div>
                  <div style={{
                    display: 'flex',
                    height: 40,
                    width: 40,
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: '#f1f5f9',
                  }}>
                    <SmartToyIcon />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <RevealSection>
            <div style={{ marginTop: 48 }}>
              <p style={{
                color: '#94a3b8',
                fontSize: 16,
                margin: 0,
                fontFamily: FONT,
              }}>
                Conversational AI meets professional-grade valuation models.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. FAQ — 4 questions in rounded cards
          ═══════════════════════════════════════════════════ */}
      <section style={{
        maxWidth: 896,
        margin: '0 auto',
        padding: '96px 24px',
      }}>
        <RevealSection style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: 900,
            color: '#0f172a',
            margin: 0,
            fontFamily: FONT,
          }}>
            Frequently Asked Questions
          </h2>
        </RevealSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            {
              q: 'How accurate is the Bizestimate\u2122?',
              a: 'Our estimates are within 5-8% of final sale prices for businesses that have utilized our Value Readiness program. We pull from over 200,000 recent private transaction data points.',
            },
            {
              q: 'Can I cancel my subscription at any time?',
              a: 'Yes. We offer month-to-month billing with no long-term contracts for the Essential and Growth plans. You can cancel directly from your dashboard.',
            },
            {
              q: 'What is "Value Readiness"?',
              a: "It's a scoring system that evaluates the 'transferability' of your business. A profitable business that can't run without its owner has low readiness and will sell for a lower multiple.",
            },
            {
              q: 'Do you offer discounts for non-profits?',
              a: 'Absolutely. We offer a 50% discount on all plans for registered 501(c)(3) organizations. Contact our support team to verify your status.',
            },
          ].map((item, i) => (
            <ScrollReveal key={item.q} delay={i * 0.06}>
              <div style={{
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                padding: 24,
              }}>
                <h4 style={{
                  marginBottom: 8,
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: 16,
                  marginTop: 0,
                  fontFamily: FONT,
                }}>
                  {item.q}
                </h4>
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: '#475569',
                  margin: 0,
                  fontFamily: FONT,
                }}>
                  {item.a}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. FINAL CTA — Large orange rounded card
          ═══════════════════════════════════════════════════ */}
      <section style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px 96px',
      }}>
        <RevealSection>
          <div style={{
            borderRadius: 40,
            backgroundColor: ORANGE,
            padding: 'clamp(48px, 6vw, 96px)',
            textAlign: 'center',
            color: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(236, 91, 19, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative blur circles */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.1,
              pointerEvents: 'none' as const,
            }}>
              <div style={{
                position: 'absolute',
                right: -80,
                top: -80,
                height: 256,
                width: 256,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                filter: 'blur(48px)',
              }} />
              <div style={{
                position: 'absolute',
                left: -80,
                bottom: -80,
                height: 256,
                width: 256,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                filter: 'blur(48px)',
              }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 900,
                margin: 0,
                lineHeight: 1.15,
                fontFamily: FONT,
              }}>
                Ready to know what your business is worth?
              </h2>
              <p style={{
                maxWidth: 560,
                margin: '24px auto 0',
                fontSize: 18,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.6,
                fontFamily: FONT,
              }}>
                Join 12,000+ business owners using smbx.ai to track, grow, and exit their companies with confidence.
              </p>
              <div className="flex flex-col sm:flex-row" style={{
                marginTop: 40,
                justifyContent: 'center',
                gap: 16,
              }}>
                <button
                  onClick={() => onChipClick('Get started with a free Bizestimate')}
                  style={{
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                    padding: '16px 40px',
                    fontSize: 18,
                    fontWeight: 700,
                    color: ORANGE,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.2s ease',
                    fontFamily: FONT,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => onChipClick('I want to speak with an M&A expert')}
                  style={{
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '16px 40px',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    transition: 'background-color 0.2s ease',
                    fontFamily: FONT,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Speak with an Expert
                </button>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

    </div>
  );
}
