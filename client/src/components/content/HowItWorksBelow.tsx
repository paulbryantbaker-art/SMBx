import {
  RevealSection,
  ScrollReveal,
  MagneticButton,
  AnimatedCounter,
  ConversationPreview,
} from './animations';

interface HowItWorksBelowProps {
  onChipClick: (text: string) => void;
}

const narrowStyle = { maxWidth: 580, margin: '0 auto' } as const;
const wideStyle = { maxWidth: 880, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' } as const;
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 } as const;
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 } as const;
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' } as const;

export default function HowItWorksBelow({ onChipClick }: HowItWorksBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. COST COMPARISON CARDS ═══ */}
      <section style={{ paddingTop: 100 }}>
        <div style={wideStyle}>
          <RevealSection>
            <div className="flex flex-col md:flex-row gap-5 justify-center">
              {/* Bloomberg */}
              <div style={{ ...cardStyle, flex: 1, textAlign: 'center', padding: '40px 32px' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)' }}>BLOOMBERG TERMINAL</span>
                <p style={{ fontSize: '48px', fontWeight: 700, color: '#0D0D0D', margin: '16px 0 8px', letterSpacing: '-0.03em', lineHeight: 1 }}>$24,000</p>
                <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)', margin: 0 }}>/year &middot; Enterprise data, bond<br />terminals</p>
              </div>
              {/* PitchBook */}
              <div style={{ ...cardStyle, flex: 1, textAlign: 'center', padding: '40px 32px' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)' }}>PITCHBOOK</span>
                <p style={{ fontSize: '48px', fontWeight: 700, color: '#0D0D0D', margin: '16px 0 8px', letterSpacing: '-0.03em', lineHeight: 1 }}>$24,000</p>
                <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)', margin: 0 }}>/year &middot; Deal sourcing platform</p>
              </div>
              {/* smbx.ai */}
              <div style={{ flex: 1, textAlign: 'center', padding: '40px 32px', background: '#0D0D0D', borderRadius: 16 }}>
                <span style={{ ...labelStyle, color: '#C96B4F' }}>SMBX.AI</span>
                <p style={{ fontSize: '48px', fontWeight: 700, color: '#C96B4F', margin: '16px 0 8px', letterSpacing: '-0.03em', lineHeight: 1 }}>$49</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>/month &middot; Built for your deal</p>
              </div>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.35)', margin: 0, fontStyle: 'italic' }}>
              Same data, analyzed for your specific situation. 400× less expensive.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. SOVEREIGN DATA — Six Sources ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <span style={labelStyle}>SOVEREIGN DATA</span>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[48px]">
              Six sources. Zero opinions.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              Every analysis starts from federal data &mdash; not crowdsourced estimates, not AI fabrications, not industry hearsay.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 48 }}>
            {[
              { title: 'U.S. Census Bureau', body: 'Business counts, industry structure, economic census, demographic patterns' },
              { title: 'Bureau of Labor Statistics', body: 'QCEW employment data, industry sector dynamics, industry-level statistics' },
              { title: 'Federal Reserve (FRED)', body: 'Interest rates, GDP output, business formation, commercial lending context' },
              { title: 'SEC EDGAR', body: 'Public comparable companies, transaction parameters, filing analysis' },
              { title: 'SBA / Treasury', body: 'Lending volumes, guarantees, SBA program parameters, financials' },
              { title: 'IRS Statistics of Income', body: 'Industry-specific profitability, entity-type analysis, benchmarks' },
            ].map((src, i) => (
              <ScrollReveal key={src.title} delay={i * 0.06}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 8px' }}>{src.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.55, margin: 0 }}>{src.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. SEVEN LAYERS DEEP — Numbered List ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <span style={labelStyle}>SEVEN LAYERS DEEP</span>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[48px]">
              Not a chatbot. An analytical engine.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              Every response draws from seven interconnected analysis layers, calibrated to your specific deal.
            </p>
          </RevealSection>

          <div style={{ marginTop: 48 }}>
            {[
              { num: 1, title: 'Financial Normalization', body: 'SDE/EBITDA calculation, add-back identification, owner benefit analysis', color: '#C96B4F' },
              { num: 2, title: 'Market Positioning', body: 'Industry multiples, geographic comps, sector growth trajectories' },
              { num: 3, title: 'Deal Structuring', body: 'SBA eligibility, seller financing, earnout modeling, tax optimization' },
              { num: 4, title: 'Risk Assessment', body: 'Customer concentration, key-person dependency, regulatory exposure, DSCR analysis' },
              { num: 5, title: 'Buyer/Investor Matching', body: 'Acquisition criteria alignment, strategic fit analysis, capital source mapping' },
              { num: 6, title: 'Document Generation', body: 'CIM, LOI, pitch decks, DD checklists — formatted, complete, export-ready' },
              { num: 7, title: 'Negotiation Intelligence', body: 'Walk-away analysis, concession strategy, walk-away thresholds, deal-killer detection' },
            ].map((layer, i) => (
              <ScrollReveal key={layer.num} delay={i * 0.06}>
                <div className="flex items-start gap-5" style={{ padding: '20px 0', borderBottom: i < 6 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      width: 40, height: 40,
                      background: layer.color || 'rgba(0,0,0,0.04)',
                      color: layer.color ? '#fff' : '#0D0D0D',
                      fontSize: '15px', fontWeight: 700,
                    }}
                  >
                    {layer.num}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 4px' }}>{layer.title}</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{layer.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. CALIBRATED DEPTH — League Cards ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <span style={labelStyle}>CALIBRATED DEPTH</span>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[48px]">
              Same platform. Different depth.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              A $300K storefront and a $30M medical group both need valuation &mdash; but the methodology, data sources, and output complexity are fundamentally different.
            </p>
          </RevealSection>

          <div className="flex flex-col md:flex-row gap-5" style={{ marginTop: 48 }}>
            {/* Under $1M */}
            <ScrollReveal delay={0} style={{ flex: 1 }}>
              <div style={{ ...cardStyle, height: '100%' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)' }}>L1&ndash;L2</span>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0D0D0D', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>Under $1M</h3>
                <div className="space-y-2">
                  {['SDE-based valuation, 2-3× multiples', 'SBA feasibility at live rates', 'Owner-operator guidance', 'Accessible plain-English delivery'].map(t => (
                    <p key={t} style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.3)', marginTop: 20, margin: '20px 0 0' }}>Metric: SDE &middot; Persona: Coach / Guide</p>
              </div>
            </ScrollReveal>

            {/* $1M–$10M — Featured */}
            <ScrollReveal delay={0.08} style={{ flex: 1 }}>
              <div style={{ background: '#0D0D0D', borderRadius: 16, padding: '28px 32px', height: '100%' }}>
                <span style={{ ...labelStyle, color: '#C96B4F' }}>L3&ndash;L4</span>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>$1M &ndash; $10M</h3>
                <div className="space-y-2">
                  {['EBITDA-based valuation, 4-8× multiples', 'PE platforms, sale-leaseback analysis', 'Working capital analysis, earnouts', 'Institutional DD frameworks'].map(t => (
                    <p key={t} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: 20, margin: '20px 0 0' }}>Metric: EBITDA &middot; Persona: Analyst / Associate</p>
              </div>
            </ScrollReveal>

            {/* $10M+ */}
            <ScrollReveal delay={0.16} style={{ flex: 1 }}>
              <div style={{ ...cardStyle, height: '100%' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)' }}>L5&ndash;L6</span>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0D0D0D', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>$10M+</h3>
                <div className="space-y-2">
                  {['DCF modeling, LBO analysis, 8-12× multiples', 'IRR modeling, capital stack with waterfall', 'Covenant analysis, PE frameworks', 'Strategic acquirer identification'].map(t => (
                    <p key={t} style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.3)', marginTop: 20, margin: '20px 0 0' }}>Metric: EBITDA &middot; Persona: Partner / Macro</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 5. LOCAL INTELLIGENCE — Split Layout ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <div className="flex flex-col md:flex-row gap-12 md:items-start">
            <div style={{ flex: 1 }}>
              <RevealSection>
                <span style={labelStyle}>LOCAL INTELLIGENCE</span>
                <h2 style={{ ...h2Style }} className="md:text-[48px]">
                  National averages are noise.
                </h2>
                <p style={{ ...bodyStyle, marginTop: 20 }}>
                  A dental practice in Manhattan and one in rural Arkansas share an industry code. They share almost nothing else. Yulia analyzes your specific market &mdash; county-level employment, regional comps, local lending corridors, demographic trajectories.
                </p>
                <p style={{ ...bodyStyle, marginTop: 16, color: '#0D0D0D', fontWeight: 600 }}>
                  Every number is contextualized to where your deal actually lives.
                </p>
              </RevealSection>
            </div>

            <ScrollReveal delay={0.1} style={{ flex: 0, minWidth: 280 }}>
              <div style={{ ...cardStyle, padding: '24px 28px' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)', display: 'block', marginBottom: 20 }}>MARKET CONTEXT &middot; DENVER MSA</span>
                {[
                  { label: 'Median household income', value: '$86,930' },
                  { label: 'Population growth (5yr)', value: '+8.2%' },
                  { label: 'Licensed dental practices', value: '847' },
                  { label: 'SBA approval rate (sector)', value: '73%' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)' }}>{item.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#0D0D0D' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 6. THE 47-SECOND STAT + CONVERSATION ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '96px', fontWeight: 700, color: '#0D0D0D', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
              <AnimatedCounter value={47} style={{ color: '#0D0D0D' }} />
            </p>
            <p style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)', marginTop: 12 }}>SECONDS TO FIRST INSIGHT</p>
            <p style={{ ...bodyStyle, marginTop: 20, textAlign: 'center' }}>
              Tell Yulia about your deal. She asks the right questions, pulls the right data, and delivers analysis &mdash; not a generic template.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <ConversationPreview
              messages={[
                { role: 'user', text: "I'm looking at a dental practice in Denver. 4 operatories, $1.2M revenue, net income $300K." },
                { role: 'ai', text: "Good deal to analyze. Denver dental market data \u2014 847 practices in the county, median household income $86,930, population up 8.2% over 5 years. At $1.2M revenue, I\u2019m estimating SDE around $330K\u2013$420K after standard dental add-backs. That puts a fair value range at $875K\u2013$1.05M on a 2.5\u20133.0\u00D7 multiple." },
              ]}
            />
          </RevealSection>

          <RevealSection style={{ marginTop: 16, textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.35)', margin: 0, fontStyle: 'italic' }}>
              The $900K ask is within range &mdash; but at the low end. Next step: run a full valuation with SBA bankability scoring.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 7. CHATGPT COMPARISON — Side-by-Side Cards ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ ...h2Style, fontSize: '32px', textAlign: 'center' }} className="md:text-[42px]">
              &ldquo;How is this different from ChatGPT?&rdquo;
            </h2>
            <p style={{ ...bodyStyle, marginTop: 12, textAlign: 'center' }}>
              We get asked this constantly. Here&apos;s the honest answer.
            </p>
          </RevealSection>

          <div className="flex flex-col md:flex-row gap-5" style={{ marginTop: 40 }}>
            <ScrollReveal delay={0} style={{ flex: 1 }}>
              <div style={{ ...cardStyle, height: '100%' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)' }}>CHATGPT</span>
                <div className="space-y-3" style={{ marginTop: 16 }}>
                  {[
                    'General purpose LLM. Knows a lot about everything.',
                    'Knows nothing about your deal. No access to federal data. No financial engine. No methodology.',
                    'Good for concepts and definitions. Not for making deal decisions.',
                    'Ask it to value a business and you\u2019ll get a nice essay with invented numbers.',
                  ].map((t, i) => (
                    <p key={i} style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.55, margin: 0 }}>{t}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} style={{ flex: 1 }}>
              <div style={{ background: '#0D0D0D', borderRadius: 16, padding: '28px 32px', height: '100%' }}>
                <span style={{ ...labelStyle, color: '#C96B4F' }}>SMBX.AI</span>
                <div className="space-y-3" style={{ marginTop: 16 }}>
                  {[
                    'Purpose-built M&A engine. 80-page methodology, six sovereign data sources.',
                    'League-calibrated analysis. Financial math engine with anti-hallucination guardrails.',
                    '23 specialized document generators. Agentic toolbelt for real-time deal analysis.',
                    'Ask it to value a business and you\u2019ll get a defensible, sourced valuation.',
                  ].map((t, i) => (
                    <p key={i} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55, margin: 0 }}>{t}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 8. FINAL CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#0D0D0D', lineHeight: 1.15, letterSpacing: '-0.035em', margin: 0 }} className="md:text-[44px]">
              Your deal deserves better than a spreadsheet.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center' }}>
              Start a conversation with Yulia. The first analysis is free.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 32, textAlign: 'center' }}>
            <MagneticButton
              onClick={() => onChipClick("Tell Yulia about your deal")}
              style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Tell Yulia about your deal
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
