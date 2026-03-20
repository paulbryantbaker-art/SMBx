import { RevealSection, ScrollReveal } from './animations';

interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  return (
    <div style={{ fontFamily: "'General Sans', 'Inter', system-ui, sans-serif" }}>

      {/* ═══ 1. HERO ═══ */}
      <RevealSection>
        <section style={{ paddingTop: 128, paddingBottom: 160 }} className="px-6">
          <div className="max-w-6xl mx-auto">
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#545454',
                margin: 0,
              }}
            >
              The Buyer&apos;s Journey
            </p>

            <h1
              className="text-6xl lg:text-[5.5rem]"
              style={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: '#000',
                marginTop: 24,
                marginBottom: 0,
              }}
            >
              The most expensive mistake
              <br />
              isn&apos;t overpaying.{' '}
              <span style={{ opacity: 0.3 }}>It&apos;s time.</span>
            </h1>

            <div
              className="grid grid-cols-1 lg:grid-cols-5 gap-12"
              style={{ marginTop: 56 }}
            >
              <div className="lg:col-span-3">
                <p
                  style={{
                    fontSize: 24,
                    color: '#545454',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  You found a listing at 9pm. Three weeks later: the SDE was
                  inflated, the DSCR didn&apos;t clear, and the right deal went
                  under LOI to someone faster. Speed to conviction is the
                  competitive advantage nobody talks about.
                </p>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => onChipClick("I want to define my acquisition thesis")}
                  className="cursor-pointer"
                  style={{
                    background: '#0D0D0D',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    padding: '18px 32px',
                    borderRadius: 10,
                    border: 'none',
                    fontFamily: 'inherit',
                    width: '100%',
                  }}
                >
                  Start Your Thesis
                </button>
                <button
                  type="button"
                  onClick={() => onChipClick("Show me live deals in my market")}
                  className="cursor-pointer"
                  style={{
                    background: '#fff',
                    color: '#0D0D0D',
                    fontSize: 16,
                    fontWeight: 700,
                    padding: '18px 32px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontFamily: 'inherit',
                    width: '100%',
                  }}
                >
                  View Live Deals
                </button>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══ 2. YULIA'S ANALYSIS ═══ */}
      <ScrollReveal>
        <section
          style={{
            background: '#F9F9F9',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            paddingTop: 100,
            paddingBottom: 100,
          }}
          className="px-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-5 items-start">
              {/* Avatar */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4FiuTMYJRaOyNAPtKuoivcm1IvvXEIpJizHDK9q5iv1GNmmV6EI5NFkmGb_MP3RdA72ayrVifJOc40DXBov2fEJb-zwuGP4Ac4Y_mVHWNXmdQ_Vsu33AP4totWAVKgB4hcFmrRVPSm3LbeA7OS4x-1XVRTLKxDLSAO_6fKqzUZA6TzEh6hmhsWgBeeAYzjcNQxLmc3OVOlKt_5x7xJdtfesZ1IgJBMKF-tgbsIMtkiroy-BpmcaGaCXqTMiUbLN28fAyxRYCZGgOM"
                alt="Yulia"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />

              {/* Chat card */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  borderRadius: 12,
                  padding: 40,
                  flex: 1,
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#545454',
                    }}
                  >
                    Yulia AI Analysis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#22c55e',
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#22c55e',
                      }}
                    >
                      Live Feed
                    </span>
                  </span>
                </div>

                {/* Quote */}
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: '#000',
                    lineHeight: 1.3,
                    margin: '0 0 20px',
                  }}
                >
                  &ldquo;I&apos;ve analyzed the Austin Dental Practice. The $1.6M
                  asking price implies 3.3x SDE &mdash; above market for the
                  metro.&rdquo;
                </p>

                {/* Analysis text */}
                <p
                  style={{
                    fontSize: 16,
                    color: '#545454',
                    lineHeight: 1.7,
                    margin: '0 0 24px',
                  }}
                >
                  The financials show 34% Medicaid patient concentration &mdash;
                  that&apos;s a risk flag. Medicaid reimbursement rates in Texas
                  are 40-60% below commercial insurance. If two major commercial
                  contracts churn, EBITDA drops 18%. The seller note structure
                  also needs restructuring under SBA 2025 standby rules.
                </p>

                {/* Verdict bar */}
                <div
                  style={{
                    background: '#0D0D0D',
                    borderRadius: 8,
                    padding: '16px 24px',
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#fff',
                      margin: 0,
                    }}
                  >
                    Verdict: Pursue &mdash; but negotiate structure
                  </p>
                </div>

                {/* Follow-up */}
                <p
                  style={{
                    fontSize: 15,
                    color: '#545454',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Counter at $1.35M&ndash;$1.45M with a Medicaid concentration
                  adjustment. Structure an earnout on commercial patient
                  retention to protect downside.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ 3. SBA FINANCING MODEL ═══ */}
      <RevealSection>
        <section style={{ paddingTop: 180, paddingBottom: 180 }} className="px-6">
          <div className="max-w-6xl mx-auto">
            <div style={{ maxWidth: 640 }}>
              <h2
                className="text-5xl"
                style={{
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: '#000',
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                SBA Financing Model
              </h2>
              <p
                style={{
                  fontSize: 24,
                  color: '#545454',
                  lineHeight: 1.5,
                  marginTop: 20,
                  marginBottom: 0,
                }}
              >
                The June 2025 SBA rule changes invalidated most deal structures
                in online guides. Here&apos;s how the Austin practice stacks up.
              </p>
            </div>

            <div
              style={{
                marginTop: 48,
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {/* Table header */}
              <div
                className="grid grid-cols-4"
                style={{
                  padding: '16px 40px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  background: '#FAFAFA',
                }}
              >
                {['Metric', 'Current Status', 'SBA 2025 Rule', 'Bankability'].map(
                  (h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#545454',
                      }}
                    >
                      {h}
                    </span>
                  )
                )}
              </div>

              {/* Data rows */}
              {[
                {
                  metric: 'DSCR Coverage',
                  status: '1.15x',
                  rule: '1.25x Required',
                  bankability: 'High Risk',
                  risk: true,
                },
                {
                  metric: 'Cash-on-Cash',
                  status: '22.4%',
                  rule: 'N/A',
                  bankability: 'Optimized',
                  risk: false,
                },
                {
                  metric: 'Seller Note',
                  status: '5% Equity',
                  rule: 'Partial Standby',
                  bankability: 'Compliant',
                  risk: false,
                },
                {
                  metric: 'Goodwill Cap',
                  status: '$850k',
                  rule: 'No Cap New',
                  bankability: 'Compliant',
                  risk: false,
                },
              ].map((row, i) => (
                <ScrollReveal key={row.metric} delay={i * 0.05}>
                  <div
                    className="grid grid-cols-4 items-center"
                    style={{
                      padding: '40px',
                      borderBottom:
                        i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#000',
                      }}
                    >
                      {row.metric}
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        color: '#545454',
                      }}
                    >
                      {row.status}
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        color: '#545454',
                      }}
                    >
                      {row.rule}
                    </span>
                    <span className="flex items-center gap-2">
                      {row.risk ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <circle cx="10" cy="10" r="10" fill="#FEE2E2" />
                          <path
                            d="M13 7L7 13M7 7l6 6"
                            stroke="#EF4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <circle cx="10" cy="10" r="10" fill="#DCFCE7" />
                          <path
                            d="M6.5 10.5L8.5 12.5L13.5 7.5"
                            stroke="#22C55E"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: row.risk ? '#EF4444' : '#22C55E',
                        }}
                      >
                        {row.bankability}
                      </span>
                    </span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══ 4. MARKET INTELLIGENCE ═══ */}
      <ScrollReveal>
        <section
          style={{
            background: '#F9F9F9',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            paddingTop: 180,
            paddingBottom: 180,
          }}
          className="px-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left column */}
              <div>
                <h2
                  className="text-5xl"
                  style={{
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    color: '#000',
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  Market Intelligence
                  <br />
                  Snapshot
                </h2>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#545454',
                    marginTop: 16,
                    marginBottom: 0,
                  }}
                >
                  HVAC Infrastructure &mdash; Dallas / Fort Worth
                </p>

                {/* Two large stat cards */}
                <div className="grid grid-cols-2 gap-4" style={{ marginTop: 40 }}>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      borderRadius: 12,
                      padding: 28,
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#545454',
                        }}
                      >
                        Companies
                      </span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p
                      style={{
                        fontSize: 48,
                        fontWeight: 900,
                        color: '#000',
                        margin: 0,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                      }}
                    >
                      847
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      borderRadius: 12,
                      padding: 28,
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#545454',
                        }}
                      >
                        PE Platforms
                      </span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p
                      style={{
                        fontSize: 48,
                        fontWeight: 900,
                        color: '#000',
                        margin: 0,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                      }}
                    >
                      12
                    </p>
                  </div>
                </div>

                {/* Bottom stats grid */}
                <div className="grid grid-cols-2 gap-4" style={{ marginTop: 16 }}>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 12,
                      padding: '20px 28px',
                    }}
                  >
                    <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#545454', margin: '0 0 4px' }}>
                      EBITDA Margin
                    </p>
                    <p style={{ fontSize: 28, fontWeight: 900, color: '#000', margin: 0, letterSpacing: '-0.02em' }}>
                      18.4%
                    </p>
                  </div>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 12,
                      padding: '20px 28px',
                    }}
                  >
                    <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#545454', margin: '0 0 4px' }}>
                      Fragmentation
                    </p>
                    <p style={{ fontSize: 28, fontWeight: 900, color: '#000', margin: 0, letterSpacing: '-0.02em' }}>
                      94%
                    </p>
                  </div>
                </div>
              </div>

              {/* Right column — image placeholder with overlay */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #E8E8E8 0%, #D4D4D4 100%)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Decorative blur circle */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '60%',
                      height: '60%',
                      borderRadius: '50%',
                      background: 'rgba(236,91,19,0.08)',
                      filter: 'blur(60px)',
                      top: '20%',
                      left: '20%',
                    }}
                  />
                </div>

                {/* Floating quote card */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -24,
                    left: -24,
                    right: 40,
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    borderRadius: 12,
                    padding: 24,
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#000', lineHeight: 1.5, margin: 0 }}>
                    &ldquo;94% fragmentation means pricing power hasn&apos;t consolidated.
                    First movers in roll-up strategy capture 2&ndash;3x arbitrage on platform multiple.&rdquo;
                  </p>
                  <p style={{ fontSize: 12, color: '#545454', marginTop: 8, marginBottom: 0 }}>
                    &mdash; Yulia, Market Analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ 5. TAX SHIELD & NEGOTIATION ═══ */}
      <RevealSection>
        <section style={{ paddingTop: 180, paddingBottom: 180 }} className="px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Left — Tax shield */}
              <div>
                <h2
                  className="text-5xl"
                  style={{
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    color: '#000',
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  The tax shield most
                  <br />
                  buyers don&apos;t model
                </h2>
                <p
                  style={{
                    fontSize: 24,
                    color: '#545454',
                    lineHeight: 1.5,
                    marginTop: 20,
                    marginBottom: 0,
                  }}
                >
                  In an asset purchase, you get a stepped-up basis. A $2M deal
                  yields $200K&ndash;$400K in tax savings over five years through
                  accelerated depreciation (Section 179 + bonus).
                </p>

                {/* Progress bars */}
                <div style={{ marginTop: 48 }}>
                  <div style={{ marginBottom: 24 }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#545454' }}>
                        Standard
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>
                        $1,240k
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 8,
                        borderRadius: 100,
                        background: 'rgba(0,0,0,0.06)',
                      }}
                    >
                      <div
                        style={{
                          width: '68%',
                          height: '100%',
                          borderRadius: 100,
                          background: '#D4D4D4',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#ec5b13' }}>
                        smbx.ai Optimized
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>
                        $1,540k
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 8,
                        borderRadius: 100,
                        background: 'rgba(0,0,0,0.06)',
                      }}
                    >
                      <div
                        style={{
                          width: '85%',
                          height: '100%',
                          borderRadius: 100,
                          background: '#ec5b13',
                        }}
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: 20, fontWeight: 700, color: '#000', margin: 0 }}>
                    ~$300K tax shield
                  </p>
                  <p style={{ fontSize: 14, color: '#545454', marginTop: 4, marginBottom: 0 }}>
                    Effective tax rate 5.5&ndash;8% in years 3&ndash;5
                  </p>
                </div>
              </div>

              {/* Right — 2x2 term cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    title: 'Working Capital',
                    label: 'The Peg',
                    body: 'Set wrong, these shift $100K+ without changing the headline number. Yulia models the right formula.',
                  },
                  {
                    title: 'Earnouts',
                    label: 'Performance',
                    body: 'Designed to look generous to the seller while structurally favoring the buyer. Yulia shows the triggers.',
                  },
                  {
                    title: 'Indemnification',
                    label: 'Escrow',
                    body: '10-15% escrowed for 12-18 months. Basket and cap structure matters. Yulia models your exposure.',
                  },
                  {
                    title: 'Reps & Warranties',
                    label: 'RWI Policy',
                    body: 'Every representation is a contingent liability. RWI policies shift risk for a 2-3% premium.',
                  },
                ].map((card, i) => (
                  <ScrollReveal key={card.title} delay={i * 0.06}>
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        borderRadius: 12,
                        padding: 28,
                        height: '100%',
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#545454',
                          margin: '0 0 8px',
                        }}
                      >
                        {card.label}
                      </p>
                      <h3
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: '#000',
                          margin: '0 0 12px',
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: '#545454',
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {card.body}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══ 6. ROAD TO OWNERSHIP ═══ */}
      <ScrollReveal>
        <section
          style={{
            background: '#F9F9F9',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            paddingTop: 180,
            paddingBottom: 180,
          }}
          className="px-6"
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-5xl"
              style={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#000',
                lineHeight: 1.1,
                margin: 0,
                textAlign: 'center',
              }}
            >
              Road to Ownership
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-5 gap-4"
              style={{ marginTop: 64 }}
            >
              {[
                {
                  num: 1,
                  title: 'Define Thesis',
                  phase: 'Phase 1',
                  body: 'Industry, geography, deal size, SBA eligibility. Investment thesis built with Yulia.',
                  active: true,
                },
                {
                  num: 2,
                  title: 'Evaluate',
                  phase: 'Phase 2',
                  body: 'Financial validation, SBA modeling, market analysis. Pursue or pass with conviction.',
                  active: false,
                },
                {
                  num: 3,
                  title: 'Negotiate',
                  phase: 'Phase 3',
                  body: 'LOI/term sheet, tax structure, negotiation intelligence. Structure to maximize.',
                  active: false,
                },
                {
                  num: 4,
                  title: 'Close',
                  phase: 'Phase 4',
                  body: 'Organized due diligence. DD checklist. Red flag scoring. Final requirements.',
                  active: false,
                },
                {
                  num: 5,
                  title: '180 Days Post',
                  phase: 'Phase 5',
                  body: 'Stabilize, optimize, execute the value creation roadmap against the model.',
                  active: false,
                },
              ].map((phase, i) => (
                <ScrollReveal key={phase.num} delay={i * 0.08}>
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      borderRadius: 12,
                      padding: 28,
                      height: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: phase.active ? '#0D0D0D' : 'rgba(0,0,0,0.06)',
                        color: phase.active ? '#fff' : '#545454',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        marginBottom: 20,
                      }}
                    >
                      {phase.num}
                    </div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#545454',
                        margin: '0 0 8px',
                      }}
                    >
                      {phase.phase}
                    </p>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: '#000',
                        margin: '0 0 12px',
                      }}
                    >
                      {phase.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: '#545454',
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {phase.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ 7. BUYER TYPES ═══ */}
      <RevealSection>
        <section style={{ paddingTop: 180, paddingBottom: 180 }} className="px-6">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-5xl"
              style={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#000',
                lineHeight: 1.1,
                margin: 0,
                textAlign: 'center',
              }}
            >
              Who is smbx.ai for?
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              style={{ marginTop: 64 }}
            >
              {[
                {
                  title: 'First-time SBA',
                  body: 'No jargon. Step by step. From thesis to close with confidence, regardless of deal size.',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="3" y="6" width="22" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 11h22" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  chip: "I'm a first-time buyer looking at SBA deals",
                },
                {
                  title: 'Search Fund',
                  body: 'More than fund-level access. Every target modeled automatically. Pipeline velocity at scale.',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                      <path d="M18 18l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                  chip: "I'm running a search fund",
                },
                {
                  title: 'PE Platform',
                  body: '$100M+ dry powder. Three bolt-on acquisitions at a time. Comparable analysis at scale.',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M4 22V10l10-6 10 6v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M10 22v-8h8v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  ),
                  chip: "We're a PE platform doing roll-ups",
                },
                {
                  title: 'Strategic Acquirer',
                  body: 'Roll-up strategy, synergies, integration complexity. New market modeling before close.',
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M14 4v20M4 14h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                  chip: "We're looking for strategic acquisitions",
                },
              ].map((card, i) => (
                <ScrollReveal key={card.title} delay={i * 0.06}>
                  <button
                    type="button"
                    onClick={() => onChipClick(card.chip)}
                    className="cursor-pointer text-left group w-full"
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      borderRadius: 12,
                      padding: 28,
                      height: '100%',
                      fontFamily: 'inherit',
                      transition: 'background 0.25s, color 0.25s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = '#0D0D0D';
                      el.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = '#fff';
                      el.style.color = '#000';
                    }}
                  >
                    <div style={{ marginBottom: 20 }}>{card.icon}</div>
                    <h3
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        margin: '0 0 12px',
                        color: 'inherit',
                      }}
                    >
                      {card.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: 'inherit',
                        opacity: 0.6,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {card.body}
                    </p>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══ 8. FINAL CTA ═══ */}
      <RevealSection>
        <section style={{ paddingBottom: 120 }} className="px-6">
          <div className="max-w-6xl mx-auto">
            <div
              style={{
                background: '#0D0D0D',
                borderRadius: 20,
                padding: '80px',
              }}
              className="flex flex-col items-center"
            >
              <h2
                className="text-5xl lg:text-7xl"
                style={{
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  lineHeight: 1.05,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                You own a business now.
              </h2>

              {/* Chat input */}
              <div
                style={{
                  marginTop: 48,
                  width: '100%',
                  maxWidth: 560,
                  position: 'relative',
                }}
              >
                <button
                  type="button"
                  onClick={() => onChipClick("Find me high-margin HVAC businesses in Dallas-Fort Worth")}
                  className="cursor-pointer w-full text-left"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 100,
                    padding: '18px 60px 18px 28px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 16,
                    fontFamily: 'inherit',
                  }}
                >
                  Find me high-margin HVAC businesses...
                </button>
                <div
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3 9h12M10 4l5 5-5 5"
                      stroke="#0D0D0D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.35)',
                  marginTop: 20,
                  marginBottom: 0,
                  textAlign: 'center',
                }}
              >
                Tell Yulia what you&apos;re looking for. She&apos;ll build your thesis.
              </p>
            </div>
          </div>
        </section>
      </RevealSection>
    </div>
  );
}
