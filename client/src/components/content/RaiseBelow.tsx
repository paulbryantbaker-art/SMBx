import { RevealSection, ScrollReveal } from './animations';

export default function RaiseBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div>
      {/* ═══ 1. HERO — "The Cost of Capital" ═══ */}
      <section
        style={{
          minHeight: '100vh',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <div style={{ maxWidth: 896, margin: '0 auto', width: '100%', paddingTop: 96, paddingBottom: 96 }}>
          <RevealSection>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#9CA3AF',
                marginBottom: 24,
                display: 'block',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              The Cost of Capital
            </span>
          </RevealSection>

          <RevealSection>
            <h2
              style={{
                fontSize: 'clamp(48px, 6vw, 72px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1,
                marginBottom: 48,
                color: '#000000',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              A 5% difference in dilution today is a{' '}
              <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>$2.5 million</span>{' '}
              difference at exit.
            </h2>
          </RevealSection>

          <RevealSection>
            <p
              style={{
                fontSize: 'clamp(20px, 2.5vw, 24px)',
                color: '#4B5563',
                lineHeight: 1.75,
                maxWidth: 672,
                fontFamily: "'Inter', system-ui, sans-serif",
                margin: 0,
              }}
            >
              Raising capital is the most expensive decision you'll ever make. We ensure you do it with surgical precision.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. NARRATIVE — "The Founders' Trap" ═══ */}
      <section style={{ paddingTop: 160, paddingBottom: 160, paddingLeft: 48, paddingRight: 48 }}>
        <div
          style={{ maxWidth: 1024, margin: '0 auto', width: '100%' }}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          <div style={{ paddingRight: 48 }}>
            <RevealSection>
              <h3
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  marginBottom: 32,
                  color: '#000000',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                The Founders' Trap
              </h3>
            </RevealSection>

            <RevealSection>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <p
                  style={{
                    fontSize: 18,
                    color: '#374151',
                    lineHeight: 1.75,
                    margin: 0,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Most founders treat fundraising as a desperate search for cash. They accept complex term sheets, opaque liquidation preferences, and unnecessary dilution simply to keep the lights on.
                </p>
                <p
                  style={{
                    fontSize: 18,
                    color: '#374151',
                    lineHeight: 1.75,
                    margin: 0,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Complexity is the enemy of equity. Between participation rights and anti-dilution clauses, the "headline price" of your round often masks the true cost of your freedom.
                </p>
              </div>
            </RevealSection>
          </div>

          <div style={{ position: 'relative' }}>
            <ScrollReveal>
              <img
                alt="Professional Finance"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCggWTqfOxdFGLqptsSyXLcC8si137QouXBB4uWjBR1Ye3DFLGuqwWQXhDKBrCg4IkwpMZd0_I6tpzmZ4Ia_0Y02pr4_dT0W3cE8dZVQ1GCzUPwCKhhX3Wwiyf3UsrHmki88KL6BA7rkx8-JuE6PqDCuoFfq9x1pgOe3_FX8FviU7Ojun-YBnaQ9KMCXfirYYunGC5Gi4ahqLHfS3ORmwkxRV8u39_Ml7H3EegX7UdBzbGUElPC148pr2mVNuQGIFh95Vs-vZrfWNTB"
                style={{
                  borderRadius: 8,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  filter: 'grayscale(100%)',
                  width: '100%',
                  display: 'block',
                }}
              />
            </ScrollReveal>

            {/* Floating "Reality Check" card */}
            <div
              className="hidden lg:block"
              style={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                backgroundColor: '#FFFFFF',
                padding: 32,
                border: '1px solid rgba(0,0,0,0.06)',
                maxWidth: 320,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.025em',
                  color: '#000000',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                Reality Check
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: '#6B7280',
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                  margin: 0,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                "90% of first-time founders miscalculate their fully diluted cap table during their first institutional round."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. FINANCING OPTIONS — "Engineered Capital Paths" ═══ */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 160,
          paddingLeft: 48,
          paddingRight: 48,
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ maxWidth: 1152, margin: '0 auto', width: '100%' }}>
          <RevealSection>
            <div style={{ marginBottom: 80, textAlign: 'center' }}>
              <h3
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: '#000000',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                Engineered Capital Paths
              </h3>
              <p
                style={{
                  color: '#6B7280',
                  maxWidth: 576,
                  margin: '0 auto',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 16,
                }}
              >
                Don't default to equity. Choose the instrument that fits your current growth velocity.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 24 }}>
            {/* Card 1: Revenue-Based */}
            <ScrollReveal>
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: '#FFFFFF',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                }}
              >
                <h4
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: '#000000',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Revenue-Based
                </h4>
                <p
                  style={{
                    color: '#4B5563',
                    marginBottom: 32,
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Fast non-dilutive capital for high-margin SaaS or recurring revenue models. Repay as you grow.
                </p>
                <div
                  className="flex"
                  style={{
                    marginTop: 'auto',
                    paddingTop: 24,
                    borderTop: '1px solid #F3F4F6',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Low Dilution
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#2563EB',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    6-12 Month Term
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: SBA Expansion */}
            <ScrollReveal>
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: '#FFFFFF',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                }}
              >
                <h4
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: '#000000',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  SBA Expansion
                </h4>
                <p
                  style={{
                    color: '#4B5563',
                    marginBottom: 32,
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Government-backed loans for established businesses moving into new territories or acquisitions.
                </p>
                <div
                  className="flex"
                  style={{
                    marginTop: 'auto',
                    paddingTop: 24,
                    borderTop: '1px solid #F3F4F6',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Zero Dilution
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#16A34A',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Fixed Rate
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3: Equity — with warning box + border-2 border-black */}
            <ScrollReveal>
              <div
                style={{
                  border: '2px solid #000000',
                  backgroundColor: '#F9F9F9',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                }}
              >
                <h4
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: '#000000',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Equity (Series A/B)
                </h4>
                <p
                  style={{
                    color: '#4B5563',
                    marginBottom: 16,
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Institutional venture capital for aggressive scaling. Requires waterfall analysis to understand exit impact.
                </p>
                {/* Warning box */}
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    padding: 12,
                    borderRadius: 4,
                    marginBottom: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#000000',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 4,
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Warning
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: '#6B7280',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      margin: 0,
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Note: 1x non-participating preferred is standard. Avoid 2x liquidation preferences.
                  </p>
                </div>
                <div
                  className="flex"
                  style={{
                    marginTop: 'auto',
                    paddingTop: 24,
                    borderTop: '1px solid #F3F4F6',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    High Dilution
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#DC2626',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Exit Focus
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 4: Strategic Partnership */}
            <ScrollReveal>
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: '#FFFFFF',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                }}
              >
                <h4
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: '#000000',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Strategic Partnership
                </h4>
                <p
                  style={{
                    color: '#4B5563',
                    marginBottom: 32,
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Capital combined with distribution. Lower valuation offset by immediate market access.
                </p>
                <div
                  className="flex"
                  style={{
                    marginTop: 'auto',
                    paddingTop: 24,
                    borderTop: '1px solid #F3F4F6',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Moderate Dilution
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#9333EA',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    LTV Boost
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 5: Mezzanine Debt */}
            <ScrollReveal>
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: '#FFFFFF',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                }}
              >
                <h4
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: '#000000',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Mezzanine Debt
                </h4>
                <p
                  style={{
                    color: '#4B5563',
                    marginBottom: 32,
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Hybrid of debt and equity. Often used as a bridge to IPO or major exit event.
                </p>
                <div
                  className="flex"
                  style={{
                    marginTop: 'auto',
                    paddingTop: 24,
                    borderTop: '1px solid #F3F4F6',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Warrant Based
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#EA580C',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Bridge Tool
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 6: Custom Structure — dashed border */}
            <ScrollReveal>
              <div
                style={{
                  border: '1px dashed #D1D5DB',
                  backgroundColor: '#F9FAFB',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                }}
              >
                <h4
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: '#9CA3AF',
                    fontStyle: 'italic',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Custom Structure
                </h4>
                <p
                  style={{
                    color: '#9CA3AF',
                    marginBottom: 32,
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Don't see your path? We engineer custom instruments for unique capital requirements.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 4. SIXTY SECONDS — Pitch deck readiness ═══ */}
      <section style={{ paddingTop: 160, paddingBottom: 160, paddingLeft: 48, paddingRight: 48 }}>
        <div style={{ maxWidth: 896, margin: '0 auto', width: '100%' }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 'clamp(36px, 5vw, 48px)',
                fontWeight: 700,
                marginBottom: 48,
                color: '#000000',
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '-0.025em',
              }}
            >
              Your pitch deck gets sixty seconds.
            </h2>
          </RevealSection>

          <RevealSection>
            <p
              style={{
                fontSize: 20,
                color: '#4B5563',
                marginBottom: 80,
                lineHeight: 1.75,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Investors don't read; they scan. We build the "Institutional Package" that answers every question before it's asked.
            </p>
          </RevealSection>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {/* Item 01 */}
            <ScrollReveal>
              <div className="flex" style={{ alignItems: 'flex-start', gap: 48 }}>
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: '#E5E7EB',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  01
                </span>
                <div
                  style={{
                    flex: 1,
                    paddingBottom: 48,
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <h5
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    The Deck
                  </h5>
                  <p
                    style={{
                      color: '#4B5563',
                      margin: 0,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 16,
                    }}
                  >
                    12 slides. High-density data. Zero fluff. Visualizing the inevitable growth of your category.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Item 02 */}
            <ScrollReveal>
              <div className="flex" style={{ alignItems: 'flex-start', gap: 48 }}>
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: '#E5E7EB',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  02
                </span>
                <div
                  style={{
                    flex: 1,
                    paddingBottom: 48,
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <h5
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    The Model
                  </h5>
                  <p
                    style={{
                      color: '#4B5563',
                      margin: 0,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 16,
                    }}
                  >
                    3-statement financial model with dynamic sensitivity analysis. Built to survive rigorous due diligence.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Item 03 */}
            <ScrollReveal>
              <div className="flex" style={{ alignItems: 'flex-start', gap: 48 }}>
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: '#E5E7EB',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  03
                </span>
                <div
                  style={{
                    flex: 1,
                    paddingBottom: 48,
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <h5
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Cap Table & Use of Funds
                  </h5>
                  <p
                    style={{
                      color: '#4B5563',
                      margin: 0,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 16,
                    }}
                  >
                    Clear visualization of where every dollar goes and exactly what it buys in terms of milestones.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Item 04 */}
            <ScrollReveal>
              <div className="flex" style={{ alignItems: 'flex-start', gap: 48 }}>
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: '#E5E7EB',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  04
                </span>
                <div style={{ flex: 1 }}>
                  <h5
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: '#000000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    Targeting List
                  </h5>
                  <p
                    style={{
                      color: '#4B5563',
                      margin: 0,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 16,
                    }}
                  >
                    Curated list of 50+ investors who specialize in your specific stage, industry, and check size.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 5. CTA — Black background section ═══ */}
      <section
        style={{
          minHeight: '100vh',
          backgroundColor: '#000000',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <div style={{ maxWidth: 896, margin: '0 auto', width: '100%', textAlign: 'center', paddingTop: 96, paddingBottom: 96 }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 'clamp(60px, 8vw, 96px)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                marginBottom: 32,
                lineHeight: 1,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Growth funded.<br />On your terms.
            </h2>
          </RevealSection>

          <RevealSection>
            <p
              style={{
                fontSize: 20,
                color: '#9CA3AF',
                marginBottom: 48,
                maxWidth: 672,
                margin: '0 auto 48px auto',
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: 1.6,
              }}
            >
              The window for your next round is narrowing. Start the architecture of your raise today.
            </p>
          </RevealSection>

          <RevealSection>
            <button
              onClick={() => onChipClick("I need to raise capital for my business — help me evaluate my options")}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontSize: 14,
                fontWeight: 700,
                padding: '16px 40px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.opacity = '0.85'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
            >
              Initialize Raise
            </button>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
