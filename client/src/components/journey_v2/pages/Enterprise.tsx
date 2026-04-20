/**
 * Glass Grok v2 · Enterprise.tsx — SITE_COPY April 2026.
 *
 * Drops the fictional anonymized quote cards. Replaces with: use-case
 * grid (LMM PE / boutique advisory / corp dev / family office),
 * enterprise feature grid, tool-consolidation ROI math table, and a
 * book-a-demo bottom.
 */
import { useState } from 'react';
import {
  DealStep, DealBench, DealBottom,
  PullQuote, StatBreaker,
  type DealTab,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const CHIPS = ['Lower middle market PE', 'Boutique M&A advisory', 'Corp dev', 'Family office'] as const;

type UseCase = { n: string; title: string; body: string; outcome: string };
const USE_CASES: readonly UseCase[] = [
  { n: '01', title: 'Lower middle market PE',       body: 'Screen add-on targets at 3× traditional sourcing volume. Exit readiness scoring across the portfolio quarterly. IC memos in 15 minutes. Portfolio monitoring automated.',  outcome: 'Replaces $40K–$120K/yr in DealCloud + sourcing spend' },
  { n: '02', title: 'Boutique M&A advisory',        body: 'Turn every analyst hour into an associate hour. CIM production from 4–6 weeks to 48 hours. Deals under $8M EBITDA become profitable engagements again.',                   outcome: 'Deals under $8M EBITDA become profitable' },
  { n: '03', title: 'Corp dev at serial acquirers', body: 'Centralized pipeline across all targets. Thesis-aligned scoring on inbound opportunities. Diligence coordination across legal, finance, HR, IT. PMI plans built from deal data.', outcome: 'Deal capacity +50–100% without headcount' },
  { n: '04', title: 'Multi-family office',           body: 'Direct-investing infrastructure without direct-investing overhead. Every deal scored against the family\'s thesis. Capital structure modeling for co-investments.',           outcome: 'Portfolio variance alerts before the P&L shows it' },
];

type FeatureRow = { title: string; body: string };
const FEATURES: readonly FeatureRow[] = [
  { title: 'Team workspace + shared deal vault', body: 'Role-based permissions. Shared deal vault. Activity feeds across the team.' },
  { title: 'White-label outputs',                body: 'CIMs, valuations, deal rooms — your logo, your letterhead, your styling. Your client sees your brand.' },
  { title: 'Unlimited seats',                    body: '6–50 seats included. Custom pricing above 50.' },
  { title: 'SSO integration',                    body: 'Okta, Google Workspace, Azure AD.' },
  { title: 'Single-tenant deployment',           body: 'For family offices, regulated entities, and firms that require isolated infrastructure.' },
  { title: 'SOC 2 audit trails',                 body: 'Complete activity logging. User actions, document access, data changes. Audit-ready.' },
  { title: 'API access',                         body: 'Programmatic access to deal data, deliverables, and workflows.' },
  { title: 'Named account manager',              body: 'Direct line. Quarterly business reviews. Onboarding support.' },
  { title: '99.9% SLA',                          body: 'Uptime guarantees with defined response times.' },
  { title: 'Compliance review workflow',         body: 'For regulated entities: pre-delivery compliance review on every outbound deliverable.' },
];

type RoiRow = { category: string; spend: string; replaces: 'full' | 'partial' };
const ROI: readonly RoiRow[] = [
  { category: 'Deal management / CRM',            spend: '$30K–$80K',   replaces: 'full' },
  { category: 'Sourcing (Grata / Sourcescrub)',   spend: '$20K–$60K',   replaces: 'partial' },
  { category: 'Data room (Datasite / Firmex)',    spend: '$15K–$40K',   replaces: 'full' },
  { category: 'Financial modeling analyst hours', spend: '$100K–$200K', replaces: 'partial' },
  { category: 'Document generation (Rogo / Hebbia)', spend: '$24K–$75K',  replaces: 'full' },
  { category: 'Portfolio monitoring tools',       spend: '$20K–$50K',   replaces: 'full' },
];

export default function Enterprise({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const [form, setForm] = useState({ name: '', company: '', email: '', teamSize: '', goals: '' });
  const canSubmit = form.name && form.company && form.email && form.teamSize;
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      chat={{
        title: 'Yulia',
        status: 'For teams + firms',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. Tell me about your firm and I'll show you how teams like yours are using smbX at scale — and what it would cost specifically for your team.",
        reply: 'Three things: <strong>firm type</strong>, <strong>team size</strong>, <strong>deals per year</strong>. I\'ll model your specific ROI before anyone books a call.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Hero */}
      <DealStep
        n={1}
        id="s1"
        idx="Enterprise"
        scale="hero"
        title={<>Your deal team, multiplied.</>}
        lede={<>For firms closing deals at scale. Shared deal vault. Team workspace. White-label outputs. SSO, audit trails, SOC 2 controls. Same Yulia, enterprise infrastructure.</>}
      />

      {/* Use cases — Bloomberg-style row table, not a card grid */}
      <DealStep
        n={2}
        id="s2"
        idx="How firms use smbX"
        title="Four firm shapes. Four different workflows."
      >
        <DealBench title="Use cases" meta="4 SHAPES · LIVE DEPLOYMENTS">
          <div style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  fontSize: 9.5,
                  letterSpacing: '0.12em',
                  color: '#9A9A9F',
                  textTransform: 'uppercase',
                }}>
                  <th style={{ textAlign: 'left',  padding: '12px 22px 8px', fontWeight: 600, width: 28 }}></th>
                  <th style={{ textAlign: 'left',  padding: '12px 12px 8px', fontWeight: 600, width: 220 }}>Shape</th>
                  <th style={{ textAlign: 'left',  padding: '12px 12px 8px', fontWeight: 600 }}>How they use Yulia</th>
                  <th style={{ textAlign: 'right', padding: '12px 22px 8px', fontWeight: 600, width: 260 }}>Typical outcome</th>
                </tr>
              </thead>
              <tbody>
                {USE_CASES.map((c, i) => (
                  <tr key={c.n} style={{
                    borderTop: '0.5px solid rgba(0,0,0,0.06)',
                    background: i % 2 === 1 ? '#FAFAFB' : undefined,
                  }}>
                    <td style={{
                      padding: '18px 0 18px 22px',
                      verticalAlign: 'top',
                      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      color: '#9A9A9F',
                      textTransform: 'uppercase',
                    }}>{c.n}</td>
                    <td style={{
                      padding: '18px 12px',
                      verticalAlign: 'top',
                    }}>
                      <div style={{
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: '-0.015em',
                        color: '#0A0A0B',
                        lineHeight: 1.2,
                      }}>{c.title}</div>
                    </td>
                    <td style={{
                      padding: '18px 12px',
                      verticalAlign: 'top',
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      color: '#3A3A3E',
                    }}>{c.body}</td>
                    <td style={{
                      padding: '18px 22px 18px 12px',
                      verticalAlign: 'top',
                      textAlign: 'right',
                      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                      fontSize: 10.5,
                      letterSpacing: '0.08em',
                      color: '#0A0A0B',
                      textTransform: 'uppercase',
                      lineHeight: 1.55,
                    }}>{c.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DealBench>
      </DealStep>

      {/* Features */}
      <DealStep
        n={3}
        id="s3"
        idx="Infrastructure"
        title="Built for teams that close deals at scale."
      >
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{
              background: '#fff',
              border: '0.5px solid rgba(0,0,0,0.08)',
              borderRadius: 10,
              padding: 14,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  fontSize: 10,
                  color: '#9A9A9F',
                  letterSpacing: '0.1em',
                  minWidth: 18,
                }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                }}>{f.title}</div>
              </div>
              <div style={{
                marginTop: 6,
                marginLeft: 28,
                fontSize: 12,
                lineHeight: 1.5,
                color: '#6B6B70',
              }}>{f.body}</div>
            </div>
          ))}
        </div>
      </DealStep>

      <PullQuote attribution="What firms actually replace">
        Deal capacity 50–100% higher without adding headcount is worth more than the cost savings.
      </PullQuote>

      {/* ROI math */}
      <DealStep
        n={4}
        id="s4"
        idx="The ROI math"
        scale="major"
        title="What you're replacing."
        lede={<>Enterprise firms typically consolidate 4–6 existing tools into a single smbX subscription. Here\'s what that looks like — before the revenue-side impact of more deal capacity per person.</>}
      >
        <DealBench title="Tool consolidation · typical firm" meta="ANNUAL SPEND">
          <div style={{ padding: 22 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  fontSize: 9.5,
                  letterSpacing: '0.1em',
                  color: '#9A9A9F',
                  textTransform: 'uppercase',
                }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600 }}>Tool category</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>Typical annual spend</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>smbX replaces</th>
                </tr>
              </thead>
              <tbody>
                {ROI.map((r) => (
                  <tr key={r.category} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                    <td style={{ padding: '11px 10px', fontWeight: 600 }}>{r.category}</td>
                    <td style={{ textAlign: 'right', padding: '11px 10px', fontVariantNumeric: 'tabular-nums', color: '#3A3A3E' }}>{r.spend}</td>
                    <td style={{ textAlign: 'right', padding: '11px 10px' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: r.replaces === 'full' ? '#22A755' : '#E8A033',
                        textTransform: 'uppercase',
                      }}>{r.replaces}</span>
                    </td>
                  </tr>
                ))}
                <tr style={{
                  borderTop: '1px solid #0A0A0B',
                  fontWeight: 700,
                }}>
                  <td style={{ padding: '14px 10px' }}>Total typical spend</td>
                  <td style={{ textAlign: 'right', padding: '14px 10px', fontVariantNumeric: 'tabular-nums' }}>$209K–$505K / yr</td>
                  <td />
                </tr>
                <tr style={{ background: '#0A0A0B', color: '#fff', fontWeight: 700 }}>
                  <td style={{ padding: '14px 10px' }}>smbX Enterprise</td>
                  <td style={{ textAlign: 'right', padding: '14px 10px', fontVariantNumeric: 'tabular-nums' }}>$30K–$120K / yr</td>
                  <td style={{ textAlign: 'right', padding: '14px 10px', color: '#7ED8A1' }}>Net $89K–$385K saved</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{
            padding: '14px 22px',
            background: '#FAFAFB',
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            fontSize: 12.5,
            lineHeight: 1.55,
            color: '#3A3A3E',
          }}>
            This is before the revenue-side impact. Our enterprise customers typically see <strong>deal capacity increase 50–100%</strong> without adding headcount — worth materially more than the cost savings.
          </div>
        </DealBench>
      </DealStep>

      {/* Book a demo */}
      <DealStep
        n={5}
        id="s5"
        idx="Book a demo"
        title="Tell us what you're building."
        lede={<>30-minute call. Real demo, not a sales pitch. We\'ll tell you whether smbX Enterprise fits and what it would cost specifically for your team.</>}
      >
        <div style={{
          marginTop: 18,
          background: '#fff',
          border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: 14,
          padding: 26,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          <FormField label="Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })} />
          <FormField label="Company"
            value={form.company}
            onChange={(v) => setForm({ ...form, company: v })} />
          <FormField label="Email (work email only)"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            type="email" />
          <div>
            <div style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 9.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6B6B70',
              marginBottom: 8,
            }}>Team size</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {['6–15', '16–50', '51–200', '200+'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, teamSize: s })}
                  style={{
                    padding: '8px 10px',
                    background: form.teamSize === s ? '#0A0A0B' : '#FAFAFB',
                    color: form.teamSize === s ? '#fff' : '#1A1C1E',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 9.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6B6B70',
              marginBottom: 8,
            }}>What are you trying to solve?</div>
            <textarea
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#FAFAFB',
                border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: 8,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 13,
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                onSend(`Book a demo — ${form.name} · ${form.company} · ${form.teamSize} · ${form.goals || '(no goals)'}`);
              }}
              style={{
                width: '100%',
                padding: '12px 18px',
                background: canSubmit ? '#0A0A0B' : '#D8D8DA',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >Book a demo →</button>
          </div>
        </div>
      </DealStep>

      <DealBottom
        heading="Tell Yulia about your firm. She'll model your specific ROI before the demo."
        sub="Firm shape, team size, deal cadence. We'll come back with a workspace config and a dollar number."
        placeholder="Firm type, team size, deals per year…"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

function FormField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#6B6B70',
        marginBottom: 8,
      }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#FAFAFB',
          border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 13,
        }}
      />
    </div>
  );
}
