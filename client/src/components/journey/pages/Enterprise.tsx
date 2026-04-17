/**
 * Glass Grok · /enterprise
 * ─────────────────────────────────────────────────────────────────────
 * For firms closing deals at scale. Hero → 4 use cases → 10 enterprise
 * features → integrations & security → ROI math → book a demo form.
 *
 * Spec: Glass Grok/SMBX_SITE_COPY.md (page 8)
 */

import { useState, type FormEvent } from 'react';
import {
  Page, Section, H2, Body,
  Card, CardGrid,
  type JourneyTab,
} from '../primitives';

interface Props { onSend: (text: string) => void; onStartFree: () => void; onNavigate?: (d: JourneyTab) => void; }

const USE_CASES = [
  { title: 'Lower middle market PE',
    body: 'Screen add-on targets at 3\u00d7 the volume of traditional sourcing. Exit readiness scoring across the portfolio quarterly. IC memos in 15 minutes. Portfolio monitoring automated. Consolidates $40K\u2013$120K/year in deal-management and sourcing tool spend.' },
  { title: 'Boutique M&A advisory',
    body: 'Turn every analyst hour into an associate hour. CIM production 4\u20136 weeks \u2192 48 hours. Valuation turnaround same-day. Deals under $8M EBITDA become profitable engagements again. 47 brokers across 23 firms are delivering the output that used to require 85.' },
  { title: 'Corp dev at serial acquirers',
    body: 'Centralized deal pipeline across all targets. Thesis-aligned scoring on inbound opportunities. Diligence coordination across legal, finance, HR, IT. Post-close integration plans built from the deal data.' },
  { title: 'Multi-family office',
    body: 'Direct-investing infrastructure without direct-investing overhead. Every deal scored against the family\u2019s thesis. Capital structure modeling for co-investment opportunities. Portfolio company monitoring with variance alerts.' },
];

const ENT_FEATURES = [
  { title: 'Team workspace',            body: 'Every user sees the deals they own and the deals the firm is running. Role-based permissions. Shared deal vault. Activity feeds across the team.' },
  { title: 'White-label outputs',       body: 'CIMs, valuations, deal rooms \u2014 all branded to your firm. Your logo, your letterhead, your styling. Your client sees your brand. Yulia is your analytical layer.' },
  { title: '10 seats flat',             body: 'Enterprise covers 10 seats at $2,500/mo flat. Larger teams get custom pricing. Every seat sees the same deal vault with role-based permissions.' },
  { title: 'SSO integration',           body: 'Okta, Google Workspace, Azure AD. Single sign-on for your entire team.' },
  { title: 'Single-tenant deployment',  body: 'For family offices, regulated entities, and firms that require isolated infrastructure.' },
  { title: 'SOC 2 audit trails',        body: 'Complete activity logging. User actions, document access, data changes. Audit-ready.' },
  { title: 'API access',                body: 'Programmatic access to deal data, deliverables, and workflows. Integrate with your existing systems.' },
  { title: 'Named account manager',     body: 'Direct line. Quarterly business reviews. Onboarding support for new users.' },
  { title: '99.9% SLA',                 body: 'Uptime guarantees with defined response times.' },
  { title: 'Compliance review workflow', body: 'For regulated entities: pre-delivery compliance review on every outbound deliverable.' },
];

const INTEGRATIONS = [
  'DealCloud, Salesforce, HubSpot (pipeline sync)',
  'Dropbox, Google Drive, SharePoint (document mirroring)',
  'DocuSign, PandaDoc (signature workflows)',
  'Okta, Azure AD, Google Workspace (SSO)',
  'Slack, Microsoft Teams (notifications)',
  'Bloomberg, CapIQ, PitchBook (data enrichment)',
];

const SECURITY = [
  'SOC 2 Type II compliance roadmap',
  '256-bit encryption at rest and in transit',
  'Role-based access controls',
  'Multi-factor authentication',
  'Single-tenant deployment option',
  'Data residency options (US, EU)',
  'Compliance-reviewed outputs for regulated entities',
  'Complete audit trails',
];

const ROI_ROWS = [
  ['Deal management / CRM',             '$30K\u2013$80K',   'Yes'],
  ['Sourcing & target databases',        '$20K\u2013$60K',   'Partial'],
  ['Virtual data room',                  '$15K\u2013$40K',   'Yes'],
  ['Financial modeling analyst hours',   '$100K\u2013$200K', 'Partial'],
  ['AI document generation tooling',     '$24K\u2013$75K',   'Yes'],
  ['Portfolio monitoring tools',         '$20K\u2013$50K',   'Yes'],
];

export default function Enterprise({ onSend, onStartFree: _, onNavigate }: Props) {
  return (
    <Page
      active="enterprise"
      onNavigate={onNavigate}
      onStartFree={() => onSend('I\u2019m interested in Enterprise. Here\u2019s what our team is solving: ')}
      ctaLabel="Book a demo"
    >
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <Section>
        <div className="gg-eyebrow" style={{ marginBottom: 16 }}>Enterprise</div>
        <h1 className="gg-h1" style={{ marginBottom: 22 }}>Your deal team, multiplied.</h1>
        <Body lead style={{ maxWidth: 720, marginBottom: 28 }}>
          For firms closing deals at scale. Shared deal vault. Team workspace. White-label outputs. SSO, audit trails, SOC 2 controls. Same Yulia, enterprise infrastructure.
        </Body>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="#book-demo" className="gg-btn gg-btn--primary">Book a demo &rarr;</a>
          <button type="button" className="gg-btn gg-btn--ghost" onClick={() => onSend('Tell me what Enterprise includes and whether it\u2019s right for our firm.')}>
            Ask Yulia
          </button>
        </div>
      </Section>

      {/* ─── Use cases ─────────────────────────────────────────────── */}
      <Section variant="tint" label="Use cases">
        <H2>How firms are using smbX.</H2>
        <div style={{ marginBottom: 28 }} />
        <CardGrid minCol={280}>
          {USE_CASES.map(u => (
            <Card key={u.title}>
              <h3 className="gg-h3" style={{ marginBottom: 10 }}>{u.title}</h3>
              <p className="gg-body" style={{ marginBottom: 0, fontSize: 14 }}>{u.body}</p>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ─── Features ──────────────────────────────────────────────── */}
      <Section label="Features">
        <H2>Built for teams that close deals at scale.</H2>
        <div style={{ marginBottom: 28 }} />
        <CardGrid minCol={260}>
          {ENT_FEATURES.map(f => (
            <Card key={f.title} padding={20}>
              <h3 className="gg-h3" style={{ marginBottom: 6, fontSize: 15 }}>{f.title}</h3>
              <p className="gg-body" style={{ marginBottom: 0, fontSize: 13 }}>{f.body}</p>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ─── Integrations + security ───────────────────────────────── */}
      <Section variant="tint" label="Integrations & security">
        <H2>Built to sit inside your existing stack.</H2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 28 }}>
          <Card padding={24}>
            <div className="gg-label" style={{ marginBottom: 14 }}>Integrations</div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              {INTEGRATIONS.map((x, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--gg-text-secondary)', marginBottom: 8, paddingLeft: 18, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--gg-text-muted)' }}>\u2022</span>
                  {x}
                </li>
              ))}
            </ul>
          </Card>
          <Card padding={24}>
            <div className="gg-label" style={{ marginBottom: 14 }}>Security</div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              {SECURITY.map((x, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--gg-text-secondary)', marginBottom: 8, paddingLeft: 18, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--gg-dot-ready)' }}>\u2713</span>
                  {x}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* ─── ROI math ──────────────────────────────────────────────── */}
      <Section label="The ROI math">
        <H2>What you\u2019re replacing.</H2>
        <Body lead style={{ maxWidth: 720 }}>
          Enterprise firms typically consolidate 4&ndash;6 existing tools into a single smbX subscription. Here\u2019s what that typically looks like:
        </Body>
        <div style={{ marginTop: 28, overflowX: 'auto', borderRadius: 'var(--gg-r-card-s)', border: '0.5px solid var(--gg-border)', background: 'var(--gg-bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--gg-body)', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--gg-bg-subtle)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tool category</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Typical annual spend</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>smbX replaces?</th>
              </tr>
            </thead>
            <tbody>
              {ROI_ROWS.map(([cat, spend, yes], i) => (
                <tr key={i} style={{ borderTop: '0.5px solid var(--gg-border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gg-text-primary)' }}>{cat}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--gg-text-muted)' }}>{spend}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: yes === 'Yes' ? 'var(--gg-band-hi-fg)' : 'var(--gg-band-med-fg)' }}>{yes}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--gg-text-primary)', background: 'var(--gg-bg-subtle)' }}>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 13 }}>TOTAL</td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 13 }}>$209K\u2013$505K/year</td>
                <td />
              </tr>
              <tr style={{ background: 'var(--gg-bg-subtle)' }}>
                <td style={{ padding: '6px 16px 14px', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 13, color: 'var(--gg-band-hi-fg)' }}>smbX Enterprise</td>
                <td style={{ padding: '6px 16px 14px', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 13, color: 'var(--gg-band-hi-fg)' }}>$30K\u2013$120K/year</td>
                <td />
              </tr>
              <tr style={{ background: 'var(--gg-bg-subtle)' }}>
                <td style={{ padding: '6px 16px 14px', fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, color: 'var(--gg-text-muted)' }}>Net savings</td>
                <td style={{ padding: '6px 16px 14px', fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, color: 'var(--gg-text-muted)' }}>$89K\u2013$385K/year</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="gg-body" style={{ marginTop: 20, maxWidth: 760 }}>
          This is before the revenue-side impact. Our enterprise customers typically see deal capacity increase 50&ndash;100% without adding headcount, which is worth materially more than the cost savings.
        </p>
      </Section>

      {/* ─── Book a demo ───────────────────────────────────────────── */}
      <Section variant="tint" label="Book a demo">
        <div id="book-demo" />
        <H2>Tell us what you\u2019re building.</H2>
        <Body lead style={{ maxWidth: 720, marginBottom: 28 }}>
          30-minute call. Real demo, not a sales pitch. We\u2019ll tell you whether smbX Enterprise fits and what it would cost specifically for your team.
        </Body>
        <DemoForm onSend={onSend} />
      </Section>
    </Page>
  );
}

function DemoForm({ onSend }: { onSend: (text: string) => void }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [teamSize, setTeamSize] = useState<string>('6\u201315');
  const [solving, setSolving] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) return;
    onSend(`Enterprise demo request.\nName: ${name}\nCompany: ${company}\nEmail: ${email}\nTeam size: ${teamSize}\nSolving: ${solving}`);
  };

  return (
    <Card padding={28} style={{ maxWidth: 640 }}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <TextField label="Name" value={name} onChange={setName} required />
        <TextField label="Company" value={company} onChange={setCompany} required />
        <TextField label="Work email" value={email} onChange={setEmail} type="email" required />
        <div>
          <div className="gg-label" style={{ marginBottom: 10 }}>Team size</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['6\u201315', '16\u201350', '51\u2013200', '200+'].map(s => (
              <button
                key={s}
                type="button"
                className={`gg-chip${s === teamSize ? ' active' : ''}`}
                aria-pressed={s === teamSize}
                onClick={() => setTeamSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="gg-label" style={{ marginBottom: 10 }}>What are you trying to solve?</div>
          <textarea
            value={solving}
            onChange={e => setSolving(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '0.5px solid var(--gg-border)',
              borderRadius: 'var(--gg-r-btn)',
              fontFamily: 'var(--gg-body)',
              fontSize: 14, lineHeight: 1.55,
              color: 'var(--gg-text-primary)',
              background: 'var(--gg-bg-app)',
              resize: 'vertical',
              outline: 'none',
            }}
            placeholder="Deal volume, current tool stack, decision-maker\u2026"
          />
        </div>
        <button type="submit" className="gg-btn gg-btn--primary" style={{ justifyContent: 'center' }} disabled={!name || !company || !email}>
          Book a demo &rarr;
        </button>
      </form>
    </Card>
  );
}

function TextField({ label, value, onChange, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="gg-label">{label}{required && ' *'}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          padding: '12px 14px',
          border: '0.5px solid var(--gg-border)',
          borderRadius: 'var(--gg-r-btn)',
          fontFamily: 'var(--gg-body)',
          fontSize: 14,
          color: 'var(--gg-text-primary)',
          background: 'var(--gg-bg-app)',
          outline: 'none',
        }}
      />
    </label>
  );
}
