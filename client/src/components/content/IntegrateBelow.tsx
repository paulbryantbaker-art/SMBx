import { useState } from 'react';
import { RevealSection, ScrollReveal } from './animations';

interface IntegrateBelowProps {
  onChipClick: (text: string) => void;
}

const font = "'Inter', system-ui, sans-serif";

export default function IntegrateBelow({ onChipClick }: IntegrateBelowProps) {
  const [ctaValue, setCtaValue] = useState('');

  return (
    <div style={{ fontFamily: font }}>
      {/* ═══ HERO ═══ */}
      <section
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          paddingTop: 128,
          paddingBottom: 192,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <div style={{ maxWidth: 768 }}>
          <RevealSection>
            <h1
              style={{
                fontFamily: font,
                fontSize: '3.75rem',
                fontWeight: 900,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                marginBottom: 48,
                color: '#111111',
              }}
            >
              70% of acquisitions fail to deliver the returns that justified the price
            </h1>
          </RevealSection>
          <RevealSection>
            <p
              style={{
                fontFamily: font,
                fontSize: '1.5rem',
                color: '#6b7280',
                lineHeight: 1.625,
                margin: 0,
              }}
            >
              The failure isn't in the thesis. It's in the execution. Most SMB
              acquisitions lose momentum in the first 100 days due to cultural
              friction and operational drift.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ NARRATIVE — The Execution Letdown ═══ */}
      <section
        style={{
          backgroundColor: '#f9fafb',
          paddingTop: 128,
          paddingBottom: 128,
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{
            maxWidth: 1024,
            margin: '0 auto',
            paddingLeft: 48,
            paddingRight: 48,
            gap: 96,
            alignItems: 'center',
          }}
        >
          <RevealSection>
            <div>
              <h2
                style={{
                  fontFamily: font,
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  marginBottom: 32,
                  color: '#111111',
                }}
              >
                The Execution Letdown
              </h2>
              <p
                style={{
                  fontFamily: font,
                  fontSize: '1.125rem',
                  color: '#4b5563',
                  marginBottom: 24,
                  lineHeight: 1.625,
                }}
              >
                Unstructured integration is the silent killer of deal value. When
                leadership is fragmented and systems aren't synced, the very
                synergies you paid for begin to evaporate.
              </p>
              <p
                style={{
                  fontFamily: font,
                  fontSize: '1.125rem',
                  color: '#4b5563',
                  lineHeight: 1.625,
                  margin: 0,
                }}
              >
                We provide the framework to capture that value from Day 1,
                transforming a chaotic transition into a systematic growth engine.
              </p>
            </div>
          </RevealSection>
          <ScrollReveal>
            <div
              style={{
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
              }}
            >
              <img
                alt="Professional team working"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX6DI04gYzqLM0dmcapBGaJ8BI_QsZrvnSjUVspmMocEcXeGNP0Rm7ZGQ-79IEd-ObSbY0LY-Z_7CSUFnbQ5XGvUh5zKEJuXePhAo53ecEtzCVONHunkVdLEh45MWChwcObChQvBT_2yDARt2zZg4TFYQmd7X96zx4fr6UweX8xW1iireSzCNnmOW7qLAOQvsvG4XdSdfQdSdUe3SDDfErI-6LLS0ieYOhQuPGAFTw0exLGCJhD6Q_4XudJjFaAoFi9OBdwejcG0dU"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 180-DAY TIMELINE ═══ */}
      <section
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          paddingTop: 192,
          paddingBottom: 192,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        {/* Timeline heading */}
        <RevealSection>
          <div style={{ marginBottom: 96, textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: font,
                fontSize: '3rem',
                fontWeight: 900,
                marginBottom: 24,
                color: '#111111',
              }}
            >
              The 180-Day Integration Roadmap
            </h2>
            <p
              style={{
                fontFamily: font,
                fontSize: '1.25rem',
                color: '#6b7280',
                margin: 0,
              }}
            >
              A disciplined approach to capturing value across three distinct
              phases.
            </p>
          </div>
        </RevealSection>

        {/* Phases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 128 }}>
          {/* Phase 1: Stabilize */}
          <ScrollReveal delay={0}>
            <div
              className="grid grid-cols-1 lg:grid-cols-12"
              style={{ gap: 48, alignItems: 'start' }}
            >
              <div className="lg:col-span-4">
                <span
                  style={{
                    fontFamily: font,
                    fontSize: '0.875rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#9ca3af',
                  }}
                >
                  Day 1 - 30
                </span>
                <h3
                  style={{
                    fontFamily: font,
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    marginTop: 8,
                    color: '#111111',
                  }}
                >
                  STABILIZE
                </h3>
              </div>
              <div
                className="lg:col-span-8"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: 40,
                  borderRadius: 16,
                  boxShadow:
                    '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
                }}
              >
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                  }}
                >
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      01
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Immediate cultural assessment and "Keep/Stop/Start"
                      feedback loops with key staff.
                    </p>
                  </li>
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      02
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Financial controls audit and transition of banking,
                      payroll, and core compliance.
                    </p>
                  </li>
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      03
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Customer sentiment outreach to ensure retention during the
                      ownership transition.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Phase 2: Optimize */}
          <ScrollReveal delay={0.1}>
            <div
              className="grid grid-cols-1 lg:grid-cols-12"
              style={{ gap: 48, alignItems: 'start' }}
            >
              <div className="lg:col-span-4">
                <span
                  style={{
                    fontFamily: font,
                    fontSize: '0.875rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#9ca3af',
                  }}
                >
                  Day 30 - 90
                </span>
                <h3
                  style={{
                    fontFamily: font,
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    marginTop: 8,
                    color: '#111111',
                  }}
                >
                  OPTIMIZE
                </h3>
              </div>
              <div
                className="lg:col-span-8"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: 40,
                  borderRadius: 16,
                  boxShadow:
                    '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
                }}
              >
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                  }}
                >
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      04
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Workflow automation: Replacing legacy manual tasks with
                      modern SaaS integrations.
                    </p>
                  </li>
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      05
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Supply chain renegotiation and vendor consolidation to
                      improve immediate margins.
                    </p>
                  </li>
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      06
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Performance dashboard deployment for real-time visibility
                      into unit economics.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* Phase 3: Grow */}
          <ScrollReveal delay={0.2}>
            <div
              className="grid grid-cols-1 lg:grid-cols-12"
              style={{ gap: 48, alignItems: 'start' }}
            >
              <div className="lg:col-span-4">
                <span
                  style={{
                    fontFamily: font,
                    fontSize: '0.875rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#9ca3af',
                  }}
                >
                  Day 90 - 180
                </span>
                <h3
                  style={{
                    fontFamily: font,
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    marginTop: 8,
                    color: '#111111',
                  }}
                >
                  GROW
                </h3>
              </div>
              <div
                className="lg:col-span-8"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: 40,
                  borderRadius: 16,
                  boxShadow:
                    '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
                }}
              >
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                  }}
                >
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      07
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Cross-selling implementation and product expansion strategy
                      activation.
                    </p>
                  </li>
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      08
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Scalable sales pipeline infrastructure and digital
                      marketing ramp-up.
                    </p>
                  </li>
                  <li className="flex" style={{ gap: 16 }}>
                    <span
                      style={{
                        fontFamily: font,
                        color: '#111111',
                        fontWeight: 700,
                      }}
                    >
                      09
                    </span>
                    <p
                      style={{
                        fontFamily: font,
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.625,
                      }}
                    >
                      Talent acquisition for key growth roles identified during
                      stabilization.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          paddingBottom: 128,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <RevealSection>
          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid rgba(0,0,0,0.06)',
              padding: 48,
              borderRadius: 24,
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontFamily: font,
                fontSize: '1.875rem',
                fontWeight: 700,
                marginBottom: 32,
                color: '#111111',
              }}
            >
              Ready to secure your integration?
            </h2>
            <div
              style={{
                maxWidth: 576,
                margin: '0 auto',
                position: 'relative',
              }}
            >
              <input
                type="text"
                placeholder="Ask about our integration framework..."
                value={ctaValue}
                onChange={(e) => setCtaValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && ctaValue.trim()) {
                    onChipClick(ctaValue.trim());
                    setCtaValue('');
                  }
                }}
                style={{
                  fontFamily: font,
                  width: '100%',
                  paddingTop: 20,
                  paddingBottom: 20,
                  paddingLeft: 32,
                  paddingRight: 120,
                  borderRadius: 9999,
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow:
                    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                  fontSize: '1.125rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#111111',
                  backgroundColor: '#ffffff',
                }}
              />
              <button
                onClick={() => {
                  const msg = ctaValue.trim() || 'I just acquired a business and need a 180-day integration plan';
                  onChipClick(msg);
                  setCtaValue('');
                }}
                style={{
                  fontFamily: font,
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  bottom: 8,
                  paddingLeft: 24,
                  paddingRight: 24,
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  borderRadius: 9999,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#1f2937')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#111111')
                }
              >
                Send
              </button>
            </div>
          </div>
        </RevealSection>
      </section>
    </div>
  );
}
