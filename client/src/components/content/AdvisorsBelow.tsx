import {
  RevealSection,
  ScrollReveal,
  MagneticButton,
  AnimatedCounter,
} from './animations';

interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

const narrowStyle = { maxWidth: 580, margin: '0 auto' } as const;
const wideStyle = { maxWidth: 880, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' } as const;
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#0D0D0D', lineHeight: 1.15, marginTop: 12 } as const;
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0 } as const;
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' } as const;

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. STAT ROW ═══ */}
      <section style={{ paddingTop: 80 }}>
        <div style={wideStyle}>
          <RevealSection>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16" style={{ padding: '48px 0', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {[
                { value: 40, suffix: '', label: 'hours per listing on analysis' },
                { value: 12, suffix: '', label: 'active listings per advisor' },
                { value: 480, suffix: '', label: 'hours/year on spreadsheets', terra: true },
                { value: 47, suffix: 's', label: 'with smbx.ai' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', minWidth: 120 }}>
                  <p style={{ fontSize: '48px', fontWeight: 700, color: stat.terra ? '#C96B4F' : '#0D0D0D', margin: 0, letterSpacing: '-0.03em', lineHeight: 1, fontStyle: 'italic' }}>
                    <AnimatedCounter value={stat.value} />{stat.suffix}
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)', margin: '8px 0 0', maxWidth: 140 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. YOUR ANALYTICAL TEAM — 6 Deliverable Cards ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <span style={labelStyle}>YOUR ANALYTICAL TEAM</span>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              Yulia handles the analysis. You close the deal.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              Every deliverable your clients need &mdash; valuations, CIMs, buyer lists, DD packages &mdash; generated in minutes, not weeks. Your expertise shapes the output. Yulia does the heavy lifting.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: 48 }}>
            {[
              { title: 'Valuations', body: 'SDE/EBITDA-based, league-calibrated, with defensible sourcing' },
              { title: 'CIM Generation', body: 'Complete confidential information memorandums, export-ready' },
              { title: 'Buyer Lists', body: 'Strategic and financial buyers matched to your specific listing' },
              { title: 'DD Packages', body: 'Due diligence checklists, risk assessments, compliance reviews' },
              { title: 'Financial Models', body: 'Interactive models with scenarios, sensitivity tables, DSCR analysis' },
              { title: 'Market Intelligence', body: 'County-level data, industry benchmarks, comparable transactions' },
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

      {/* ═══ 3. PARTNER PROGRAM — 3 Tier Cards ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={wideStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <span style={labelStyle}>PARTNER PROGRAM</span>
            <h2 style={{ ...h2Style, textAlign: 'center' }} className="md:text-[42px]">
              Three tiers. One standard.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 12, textAlign: 'center', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              Every partner tier gives your clients access to Yulia&apos;s full analytical engine. The difference is scale, support, and economics.
            </p>
          </RevealSection>

          <div className="flex flex-col md:flex-row gap-5" style={{ marginTop: 48 }}>
            {/* Certified */}
            <ScrollReveal delay={0} style={{ flex: 1 }}>
              <div style={{ ...cardStyle, height: '100%' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)' }}>CERTIFIED</span>
                <p style={{ fontSize: '40px', fontWeight: 700, color: '#0D0D0D', margin: '12px 0 4px', letterSpacing: '-0.03em', lineHeight: 1 }}>$99<span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(0,0,0,0.4)' }}>/mo</span></p>
                <div className="space-y-2" style={{ marginTop: 20 }}>
                  {['Up to 5 active client deals', 'Full deliverable suite', 'White-label exports', 'Email support'].map(t => (
                    <p key={t} style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Premier — Featured */}
            <ScrollReveal delay={0.08} style={{ flex: 1 }}>
              <div style={{ background: '#0D0D0D', borderRadius: 16, padding: '28px 32px', height: '100%' }}>
                <span style={{ ...labelStyle, color: '#C96B4F' }}>PREMIER</span>
                <p style={{ fontSize: '40px', fontWeight: 700, color: '#C96B4F', margin: '12px 0 4px', letterSpacing: '-0.03em', lineHeight: 1 }}>$299<span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/mo</span></p>
                <div className="space-y-2" style={{ marginTop: 20 }}>
                  {['Up to 20 active client deals', 'Priority analysis queue', 'Custom branding on all exports', 'Dedicated account manager'].map(t => (
                    <p key={t} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Elite */}
            <ScrollReveal delay={0.16} style={{ flex: 1 }}>
              <div style={{ ...cardStyle, height: '100%' }}>
                <span style={{ ...labelStyle, color: 'rgba(0,0,0,0.3)' }}>ELITE</span>
                <p style={{ fontSize: '40px', fontWeight: 700, color: '#0D0D0D', margin: '12px 0 4px', letterSpacing: '-0.03em', lineHeight: 1 }}>Custom</p>
                <div className="space-y-2" style={{ marginTop: 20 }}>
                  {['Unlimited active deals', 'API access for integrations', 'Custom methodology overlays', 'SLA-backed support'].map(t => (
                    <p key={t} style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 4. FINAL CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={narrowStyle}>
          <RevealSection style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#0D0D0D', lineHeight: 1.15, letterSpacing: '-0.035em', margin: 0 }} className="md:text-[44px]">
              Close more deals. Build fewer spreadsheets.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16, textAlign: 'center' }}>
              Join the partner program and give your clients institutional-quality analysis from day one.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 32, textAlign: 'center' }}>
            <MagneticButton
              onClick={() => onChipClick("I'm an advisor \u2014 tell me about partnerships")}
              style={{ background: '#0D0D0D', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Apply to partner program
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
