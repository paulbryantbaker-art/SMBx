import { RevealSection, ScrollReveal } from './animations';

interface HowItWorksBelowProps {
  onChipClick: (text: string) => void;
}

const font = "'General Sans', 'Inter', system-ui, sans-serif";

export default function HowItWorksBelow({ onChipClick }: HowItWorksBelowProps) {
  return (
    <div style={{ fontFamily: font, backgroundColor: '#FFFFFF', color: '#000000' }}>

      {/* ═══ 1. HERO — "The Information Gap" ═══ */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '128px 96px',
        }}
      >
        <div style={{ maxWidth: 896 }}>
          <RevealSection>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#9CA3AF',
                marginBottom: 32,
                display: 'block',
                fontFamily: font,
              }}
            >
              The Information Gap
            </span>
            <h1
              style={{
                fontSize: 72,
                fontWeight: 800,
                marginBottom: 48,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                fontFamily: font,
              }}
            >
              Bloomberg charges $24,000 a year. <br />
              <span style={{ color: '#D1D5DB' }}>You have Google.</span>
            </h1>
            <p
              style={{
                fontSize: 24,
                color: '#6B7280',
                lineHeight: 1.75,
                maxWidth: 672,
                margin: 0,
                fontFamily: font,
              }}
            >
              The middle market is an information desert. While Wall Street uses
              high-fidelity data to price assets, main street relies on
              &ldquo;gut feelings&rdquo; and generic AI hallucinations. We built
              smbx.ai to bridge that gap.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. NARRATIVE — "The Information Desert" ═══ */}
      <section
        style={{
          padding: '160px 96px',
          backgroundColor: 'rgba(249,250,251,0.3)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ maxWidth: 896, margin: '0 auto', textAlign: 'center' }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 700,
                marginBottom: 32,
                letterSpacing: '-0.02em',
                fontFamily: font,
              }}
            >
              The Information Desert
            </h2>
            <p
              style={{
                fontSize: 20,
                color: '#6B7280',
                lineHeight: 2,
                margin: 0,
                fontFamily: font,
              }}
            >
              Private company data isn&rsquo;t just hard to find&mdash;it&rsquo;s
              fragmented, messy, and often proprietary. Most search engines stop
              at the surface. smbx.ai dives into sovereign data repositories,
              stitching together a high-resolution map of any local economy,
              industry structure, and financial reality.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 3. DATA SOURCES — "Sovereign Data Trust" ═══ */}
      <section style={{ padding: '192px 96px' }}>
        <div style={{ marginBottom: 80 }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                marginBottom: 16,
                letterSpacing: '-0.02em',
                fontFamily: font,
              }}
            >
              Sovereign Data Trust
            </h2>
            <p
              style={{
                color: '#6B7280',
                fontSize: 20,
                margin: 0,
                fontFamily: font,
              }}
            >
              We don&rsquo;t scrape blogs. We ingest raw truth from sovereign
              sources.
            </p>
          </RevealSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
          {([
            {
              abbr: 'CB',
              title: 'Census Bureau',
              body: 'Granular demographic shifts and localized spending power metrics.',
            },
            {
              abbr: 'BLS',
              title: 'Bureau of Labor Statistics',
              body: 'Real-time wage trends and labor participation at the ZIP code level.',
            },
            {
              abbr: 'FR',
              title: 'FRED (Federal Reserve)',
              body: 'Macroeconomic indicators and monetary data translated for small business.',
            },
            {
              abbr: 'SEC',
              title: 'SEC EDGAR',
              body: 'Public comps and industry benchmarks from 10-K and 10-Q filings.',
            },
            {
              abbr: 'SBA',
              title: 'SBA Lender Activity',
              body: 'Historical default rates and loan volumes for specific NAICS codes.',
            },
            {
              abbr: 'IRS',
              title: 'IRS SOI',
              body: 'Anonymized tax statistics for precise revenue benchmarking.',
            },
          ] as const).map((src, i) => (
            <ScrollReveal key={src.abbr} delay={i * 0.06}>
              <div
                className="group"
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 32,
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12,
                  transition: 'all 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)';
                  const icon = el.querySelector('[data-icon]') as HTMLElement | null;
                  if (icon) {
                    icon.style.backgroundColor = '#000000';
                    icon.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.boxShadow = 'none';
                  const icon = el.querySelector('[data-icon]') as HTMLElement | null;
                  if (icon) {
                    icon.style.backgroundColor = '#F3F4F6';
                    icon.style.color = '#9CA3AF';
                  }
                }}
              >
                <div
                  data-icon
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 6,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#9CA3AF',
                    fontSize: 14,
                    transition: 'all 0.3s',
                    fontFamily: font,
                  }}
                >
                  {src.abbr}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 8,
                    fontFamily: font,
                  }}
                >
                  {src.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: '#6B7280',
                    lineHeight: 1.75,
                    margin: 0,
                    fontFamily: font,
                  }}
                >
                  {src.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ 4. SEVEN DIMENSIONS — Black bg, 4-col grid ═══ */}
      <section
        style={{
          padding: '192px 96px',
          backgroundColor: '#000000',
          color: '#FFFFFF',
        }}
      >
        <div style={{ maxWidth: 768, marginBottom: 96 }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 800,
                marginBottom: 32,
                fontStyle: 'italic',
                letterSpacing: '-0.02em',
                fontFamily: font,
              }}
            >
              &ldquo;A real deal analysis isn&rsquo;t one thing. It&rsquo;s
              seven.&rdquo;
            </h2>
            <p
              style={{
                color: '#9CA3AF',
                fontSize: 20,
                margin: 0,
                fontFamily: font,
              }}
            >
              We break down every business through seven distinct analytical
              lenses.
            </p>
          </RevealSection>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{
            gap: 1,
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {([
            {
              num: '01',
              title: 'Industry Structure',
              body: 'Competitive density, barriers to entry, and supplier power dynamics.',
            },
            {
              num: '02',
              title: 'Regional Economics',
              body: 'Local GDP growth, migration patterns, and municipal zoning impacts.',
            },
            {
              num: '03',
              title: 'Financial Normalization',
              body: 'Stripping SDE to find true EBITDA. Understanding real cash flow.',
            },
            {
              num: '04',
              title: 'Buyer Landscape',
              body: 'Who is buying? PE rollups, search funds, or strategic competitors?',
            },
            {
              num: '05',
              title: 'Deal Architecture',
              body: 'Debt service coverage, earn-out structures, and equity requirements.',
            },
            {
              num: '06',
              title: 'Risk Assessment',
              body: 'Key man dependency, customer concentration, and tech debt.',
            },
            {
              num: '07',
              title: 'Forward Signals',
              body: 'Predictive modeling on industry longevity and disruption vectors.',
            },
          ] as const).map((dim, i) => (
            <ScrollReveal key={dim.num} delay={i * 0.05}>
              <div
                style={{
                  padding: 40,
                  backgroundColor: '#000000',
                  transition: 'background-color 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#18181B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'Courier New', 'Courier', monospace",
                    color: '#71717A',
                    marginBottom: 16,
                    display: 'block',
                  }}
                >
                  {dim.num}
                </span>
                <h4
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 12,
                    fontFamily: font,
                  }}
                >
                  {dim.title}
                </h4>
                <p
                  style={{
                    fontSize: 14,
                    color: '#A1A1AA',
                    margin: 0,
                    lineHeight: 1.6,
                    fontFamily: font,
                  }}
                >
                  {dim.body}
                </p>
              </div>
            </ScrollReveal>
          ))}

          {/* Unified Signal — dashed border cell */}
          <ScrollReveal delay={0.4}>
            <div
              style={{
                padding: 40,
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 180,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 100,
                  border: '1px dashed #3F3F46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: '#52525B',
                    fontFamily: font,
                  }}
                >
                  Unified Signal
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 5. COMPARISON — "Scale-Agnostic Intelligence" ═══ */}
      <section style={{ padding: '192px 96px' }}>
        <div className="flex flex-col lg:flex-row" style={{ alignItems: 'center', gap: 96 }}>
          <div style={{ width: '50%', minWidth: 0 }}>
            <RevealSection>
              <h2
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  marginBottom: 32,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  fontFamily: font,
                }}
              >
                Scale-Agnostic Intelligence
              </h2>
              <p
                style={{
                  fontSize: 20,
                  color: '#6B7280',
                  lineHeight: 1.75,
                  marginBottom: 48,
                  fontFamily: font,
                }}
              >
                The same engine that analyzes a $400K local landscaping route is
                used to vet $40M precision manufacturing platforms. Data
                doesn&rsquo;t care about size&mdash;it cares about accuracy.
              </p>
              <div className="flex" style={{ gap: 16 }}>
                <div
                  style={{
                    padding: 24,
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 8,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      fontFamily: font,
                    }}
                  >
                    SMB Range
                  </span>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      fontFamily: font,
                    }}
                  >
                    $1M - $5M
                  </div>
                </div>
                <div
                  style={{
                    padding: 24,
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 8,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      fontFamily: font,
                    }}
                  >
                    Mid-Market
                  </span>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      fontFamily: font,
                    }}
                  >
                    $10M - $100M
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>

          {/* Bar chart visualization */}
          <ScrollReveal delay={0.1} style={{ width: '50%', minWidth: 0 }}>
            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid rgba(0,0,0,0.06)',
                padding: 48,
                borderRadius: 16,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                className="flex"
                style={{
                  height: 256,
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                <div style={{ width: 16, backgroundColor: '#E5E7EB', height: '25%' }} />
                <div style={{ width: 16, backgroundColor: '#E5E7EB', height: '50%' }} />
                <div style={{ width: 16, backgroundColor: '#000000', height: '75%' }} />
                <div style={{ width: 16, backgroundColor: '#E5E7EB', height: '50%' }} />
                <div style={{ width: 16, backgroundColor: '#D1D5DB', height: '100%' }} />
                <div style={{ width: 16, backgroundColor: '#E5E7EB', height: '33%' }} />
                <div style={{ width: 16, backgroundColor: '#000000', height: '67%' }} />
                <div style={{ width: 16, backgroundColor: '#F3F4F6', height: '50%' }} />
                <div style={{ width: 16, backgroundColor: '#000000', height: '83%' }} />
              </div>
              <div
                style={{
                  marginTop: 32,
                  paddingTop: 32,
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <div
                  className="flex"
                  style={{
                    justifyContent: 'space-between',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#9CA3AF',
                    fontFamily: font,
                  }}
                >
                  <span>SOVEREIGN FLOW</span>
                  <span>100% RESOLUTION</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 6. NATIONAL AVERAGES — centered quote ═══ */}
      <section
        style={{
          padding: '160px 96px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 768, margin: '0 auto' }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 900,
                marginBottom: 32,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                fontFamily: font,
              }}
            >
              &ldquo;National averages are meaningless.&rdquo;
            </h2>
            <p
              style={{
                fontSize: 20,
                color: '#6B7280',
                lineHeight: 1.75,
                margin: 0,
                fontFamily: font,
              }}
            >
              The EBITDA multiple for an HVAC company in Miami is fundamentally
              different than one in Dallas-Fort Worth. Why? Because the labor
              pool, housing starts, and regulatory environment aren&rsquo;t the
              same. We ignore the average and find the local truth.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 7. CONVERSATION MOCKUP — browser card ═══ */}
      <section
        style={{
          padding: '192px 96px',
          backgroundColor: '#F9FAFB',
        }}
      >
        <div
          style={{
            maxWidth: 896,
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Browser chrome bar */}
          <RevealSection>
            <div
              className="flex"
              style={{
                padding: 16,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                backgroundColor: '#F9FAFB',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#F87171',
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#FBBF24',
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#34D399',
                }}
              />
              <span
                style={{
                  marginLeft: 16,
                  fontSize: 12,
                  fontFamily: "'Courier New', 'Courier', monospace",
                  color: '#9CA3AF',
                }}
              >
                smbx.ai / workspace / hvac-dfw-analysis
              </span>
            </div>
          </RevealSection>

          {/* Chat content */}
          <div style={{ padding: 48 }}>
            {/* User message */}
            <ScrollReveal delay={0.1}>
              <div className="flex" style={{ gap: 24, marginBottom: 48 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: '#000000',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                      margin: 0,
                      lineHeight: 1.5,
                      fontFamily: font,
                    }}
                  >
                    &ldquo;Analyze the competitive density of residential HVAC in
                    the DFW metroplex.&rdquo;
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* AI response */}
            <ScrollReveal delay={0.2}>
              <div className="flex" style={{ gap: 24 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: '#2563EB',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      color: '#4B5563',
                      lineHeight: 1.75,
                      margin: '0 0 24px',
                      fontFamily: font,
                    }}
                  >
                    Found 1,248 active licenses in Tarrant &amp; Dallas counties.
                  </p>

                  {/* Data card */}
                  <div
                    style={{
                      padding: 24,
                      backgroundColor: '#F9FAFB',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 12,
                      marginBottom: 24,
                    }}
                  >
                    <div className="grid grid-cols-2" style={{ gap: 32 }}>
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            color: '#9CA3AF',
                            fontFamily: font,
                          }}
                        >
                          Saturation Index
                        </span>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            fontFamily: font,
                          }}
                        >
                          7.2/10 (High)
                        </div>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            color: '#9CA3AF',
                            fontFamily: font,
                          }}
                        >
                          Median Tech Wage
                        </span>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            fontFamily: font,
                          }}
                        >
                          $28.40 /hr
                        </div>
                      </div>
                    </div>
                  </div>

                  <p
                    style={{
                      color: '#4B5563',
                      lineHeight: 1.75,
                      margin: 0,
                      fontFamily: font,
                    }}
                  >
                    While density is high, 42% of firms are owner-operators with
                    no succession plan. A rollup play is viable if focusing on the
                    North Denton corridor where housing permits grew 18% YoY.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 8. COMPARISON LIST — "What does this do that ChatGPT can't?" ═══ */}
      <section style={{ padding: '192px 96px' }}>
        <div style={{ maxWidth: 896, margin: '0 auto' }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                marginBottom: 64,
                letterSpacing: '-0.02em',
                fontFamily: font,
              }}
            >
              What does this do that ChatGPT can&rsquo;t?
            </h2>
          </RevealSection>

          <div>
            {([
              {
                title: 'Hallucination Management',
                body: 'LLMs guess; we verify. Every data point is traced back to a sovereign PDF or API endpoint.',
              },
              {
                title: 'Temporal Accuracy',
                body: "ChatGPT has a training cutoff. We pull this morning's economic releases.",
              },
              {
                title: 'Domain Specificity',
                body: "General AI doesn't understand the difference between SDE and EBITDA. We were built by M&A professionals.",
              },
              {
                title: 'Security',
                body: 'Your deal data is siloed. It is never used to train global models. Your edge stays your edge.',
              },
            ] as const).map((row, i) => (
              <ScrollReveal key={row.title} delay={i * 0.06}>
                <div
                  className="grid grid-cols-1 md:grid-cols-2"
                  style={{
                    padding: '32px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                      fontFamily: font,
                    }}
                  >
                    {row.title}
                  </div>
                  <div
                    style={{
                      color: '#6B7280',
                      lineHeight: 1.6,
                      fontFamily: font,
                    }}
                  >
                    {row.body}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. CTA PILL — floating input + button ═══ */}
      <section
        style={{
          padding: '48px 96px 96px',
        }}
      >
        <div style={{ maxWidth: 896, margin: '0 auto' }}>
          <RevealSection>
            <div
              className="flex"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                borderRadius: 9999,
                padding: 8,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: '0 32px',
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#9CA3AF',
                  fontFamily: font,
                }}
              >
                Describe a deal you&rsquo;re looking at...
              </div>
              <button
                onClick={() =>
                  onChipClick('I want to analyze a deal')
                }
                style={{
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  padding: '16px 32px',
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontFamily: font,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1F2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                Run Analysis
              </button>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
