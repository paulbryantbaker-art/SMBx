import { useState } from 'react';
import { MarketingShell } from '../MarketingShell';
import { Brand } from '../Brand';
import { enterApp } from '../useEnterApp';

const TIERS: Array<{ name: string; price: string; per?: string; desc: string; features: string[] }> = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Get started, no card.',
    features: [
      'Unlimited conversation with Yulia',
      'One deliverable artifact, free (The Baseline)',
      'The full methodology library',
    ],
  },
  {
    name: 'Solo',
    price: '$99',
    per: '/ month',
    desc: 'Everything in Free, plus:',
    features: [
      'Unlimited valuation, deal scoring, SDE/EBITDA analysis',
      'Working capital, financing, and structuring models',
      'PDF / Excel / Word export',
      'One supervised agent key',
    ],
  },
  {
    name: 'Pro',
    price: '$249',
    per: '/ month',
    desc: 'Everything in Solo, plus:',
    features: [
      'CIM and pitch-book generation',
      'Deal rooms and market discovery',
      'Due diligence and LOI scaffolds',
      'Three supervised agent keys',
    ],
  },
  {
    name: 'Team',
    price: '$749',
    per: '/ month',
    desc: 'Everything in Pro, plus:',
    features: [
      'Shared deal vault and firm templates',
      'Multiple seats',
      'Specialist handoff coordination',
    ],
  },
];

const ONEOFF: Array<{ kind: string; name: string; price: string }> = [
  { kind: 'PREVIEW', name: 'Quality-of-earnings preview', price: '$99' },
  { kind: 'DOCUMENT', name: 'CIM', price: '$499' },
  { kind: 'DOSSIER', name: 'Valuation dossier', price: '$999' },
];

const NEVER = [
  'No success fee.',
  'No percentage of deal value.',
  'No fee contingent on a deal closing.',
  'No referral or finder’s fee.',
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'Is the methodology really free?',
    a: 'Yes. The Diligence Standard is open to everyone, no account required.',
  },
  {
    q: 'Do I need a subscription to try it?',
    a: 'No. Talk to Yulia and generate your first deliverable free.',
  },
  {
    q: 'Can I buy one artifact without subscribing?',
    a: 'Yes — see per-artifact pricing above. Each is a one-time software fee.',
  },
  {
    q: 'Is smbX.ai a broker or advisor?',
    a: 'smbX.ai is software. It computes the diligence work — valuations, models, allocations, and documents. It does not broker, advise, negotiate, or represent any party.',
  },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingBottom: 'calc(var(--pad-y) * .5)' }}>
        <div className="wrap center reveal" style={{ maxWidth: '54ch', margin: '0 auto' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Pricing</span>
          <h1 className="display" style={{ fontSize: 'clamp(2.3rem,4.4vw,3.8rem)', marginTop: 18 }}>
            Flat software pricing. Nothing tied to your deal.
          </h1>
          <p className="lead" style={{ marginTop: 22, maxWidth: '52ch', marginLeft: 'auto', marginRight: 'auto' }}>
            Pay for the software, by the month or by the artifact. No fee scales with your
            deal’s value. No fee depends on whether it closes.
          </p>
        </div>
      </section>

      {/* TIERS */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap-wide">
          <div className="tiers reveal">
            {TIERS.map(t => (
              <div className="tier" key={t.name}>
                <div className="tname">{t.name}</div>
                <div className="tprice">{t.price}{t.per && <small> {t.per}</small>}</div>
                <div className="tdesc">{t.desc}</div>
                <ul>
                  {t.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => enterApp()}>
                  Ask Yulia
                </button>
              </div>
            ))}
          </div>

          {/* Enterprise band */}
          <div
            className="reveal"
            style={{
              marginTop: 16,
              background: 'var(--ink)',
              color: '#fff',
              borderRadius: 'var(--radius)',
              padding: '36px 40px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 32,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.74rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
                Enterprise · from $3,000 / month
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: 12 }}>
                Everything in Team, plus governed scale.
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', color: 'rgba(255,255,255,.72)', fontSize: '.95rem' }}>
                <span>Single-tenant deployment, SSO, and API controls</span>
                <span>Portfolio infrastructure and custom governance</span>
                <span>Governed autonomous agent scope</span>
              </div>
            </div>
            <button className="btn btn-accent btn-lg" style={{ whiteSpace: 'nowrap' }} onClick={() => enterApp()}>
              Talk to Yulia about Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* PER-ARTIFACT */}
      <section style={{ background: 'var(--surface-2)' }}>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '56ch', marginBottom: 44 }}>
            <span className="eyebrow">One-off, no subscription</span>
            <h2 style={{ marginTop: 18 }}>Need one artifact? Buy just that one.</h2>
          </div>
          <div className="oneoff reveal">
            {ONEOFF.map(o => (
              <div className="card" key={o.name}>
                <div className="mono" style={{ fontSize: '.74rem', color: 'var(--ink-3)', letterSpacing: '.06em' }}>{o.kind}</div>
                <h3 style={{ marginTop: 6 }}>{o.name}</h3>
                <div className="op">{o.price}</div>
                <p style={{ marginTop: 'auto', paddingTop: 14 }}>Generate it, own it, export it.</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24, fontFamily: 'var(--mono)', fontSize: '.85rem', color: 'var(--ink-3)' }}>
            Each is a one-time software fee, charged on generation.
          </p>
        </div>
      </section>

      {/* WHAT WE NEVER CHARGE — safe-harbor anchor */}
      <section className="dark">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <span className="eyebrow">The line</span>
            <h2 style={{ marginTop: 18, maxWidth: '14ch' }}>What we never charge.</h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: '44ch' }}>
              <Brand /> is software. Every fee is flat — a subscription or a per-artifact price,
              charged on generation. Nothing we charge moves with the size or outcome of
              your deal.
            </p>
          </div>
          <div className="reveal" data-d="1" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {NEVER.map(n => (
              <div className="kv" key={n} style={{ padding: '16px 0' }}>
                <span style={{ color: '#fff', fontWeight: 500 }}>{n}</span>
                <span className="mono" style={{ fontSize: '.82rem', color: 'var(--accent)' }}>never</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 'var(--pad-y)' }}>
        <div className="wrap">
          <div className="faq reveal">
            <h2 style={{ marginBottom: 24 }}>Questions</h2>
            {FAQ.map((item, i) => (
              <div className={`faq-item${openFaq === i ? ' open' : ''}`} key={item.q}>
                <button
                  className="faq-q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <span className="pm" />
                </button>
                <div className="faq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="center" style={{ background: 'var(--surface-2)' }}>
        <div className="wrap stack reveal" style={{ alignItems: 'center' }}>
          <h2 style={{ maxWidth: '18ch' }}>Start free. One deliverable, no card.</h2>
          <div style={{ marginTop: 28 }}>
            <button className="btn btn-accent btn-lg" onClick={() => enterApp()}>Ask Yulia</button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
