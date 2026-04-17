/**
 * Glass Grok · /pricing
 * ─────────────────────────────────────────────────────────────────────
 * Five-tier flat ladder. Every paid tier ships every hero capability.
 * Enterprise: flat $2,500/mo, 10 seats (Paul-locked override, not
 * "custom from"). Comparison table → 7 capability cards → FAQ → CTA.
 *
 * Spec: Glass Grok/SMBX_SITE_COPY.md (page 6)
 * Pricing canon: project_pricing_canon_2026_04.md
 */

import { useState } from 'react';
import {
  Page, Section, H2, Body,
  Card, CardGrid, BottomCta,
} from '../primitives';

interface Props { onSend: (text: string) => void; onStartFree: () => void; }

type TierKey = 'free' | 'solo' | 'pro' | 'team' | 'enterprise';

interface Tier {
  key: TierKey;
  name: string;
  price: string;
  priceSuffix: string;
  who: string;
  cta: string;
  highlighted?: boolean;
}

const TIERS: readonly Tier[] = [
  { key: 'free',       name: 'Free',       price: '$0',      priceSuffix: 'forever',           who: 'Trying Yulia out',                                                                                   cta: 'Start free' },
  { key: 'solo',       name: 'Solo',       price: '$79',     priceSuffix: '/mo',               who: 'Solo operators, self-funded searchers, principal sellers/buyers',                                    cta: 'Start Solo' },
  { key: 'pro',        name: 'Pro',        price: '$199',    priceSuffix: '/mo',               who: 'Practitioners \u2014 IS, search funders, LMM advisors, solo bankers',                                cta: 'Start Pro', highlighted: true },
  { key: 'team',       name: 'Team',       price: '$499',    priceSuffix: '/mo \u00b7 5 seats', who: 'Boutique firms, small corp dev teams, multi-person family offices',                                 cta: 'Start Team' },
  { key: 'enterprise', name: 'Enterprise', price: '$2,500',  priceSuffix: '/mo \u00b7 10 seats', who: 'Firms, corp dev at serial acquirers, PE funds, regulated entities',                                cta: 'Talk to Yulia' },
] as const;

interface MatrixRow {
  feature: string;
  values: Record<TierKey, string | boolean>;
}

const MATRIX: readonly MatrixRow[] = [
  { feature: 'Deliverables',                    values: { free: '1 total',   solo: 'Unlimited', pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' } },
  { feature: 'Active deals',                    values: { free: '1',         solo: '1',         pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' } },
  { feature: 'Seats',                           values: { free: '1',         solo: '1',         pro: '1',         team: '5',         enterprise: '10' } },
  /* hero capabilities — all true on every paid tier */
  { feature: 'Add-back / QoE Lite analysis',    values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'SBA SOP 50 10 8 structure modeling', values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Deal screening \u00b7 The Rundown', values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'CIM / teaser drafting',           values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'LOI & term sheet drafting',       values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Investor memos & LP updates',     values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Due diligence coordination',      values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Buyer list building',             values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Post-close PMI workflows',        values: { free: false, solo: true, pro: true, team: true, enterprise: true } },
  /* team */
  { feature: 'Team workspace',                  values: { free: false, solo: false, pro: false, team: true, enterprise: true } },
  { feature: 'Shared deal vault',               values: { free: false, solo: false, pro: false, team: true, enterprise: true } },
  { feature: 'White-label outputs',             values: { free: false, solo: false, pro: false, team: true, enterprise: true } },
  /* enterprise infra */
  { feature: 'SSO (Okta, Google, Azure)',       values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'Single-tenant deployment',        values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'SOC 2 Type II audit trails',      values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'Named account manager',           values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: '99.9% SLA',                       values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'API access',                      values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
];

const CAPABILITY_CARDS = [
  { title: 'Add-back & QoE Lite analysis', body: 'Find the value hiding in financials. Pre-LOI earnings quality analysis. 20 minutes, not 6 weeks.' },
  { title: 'SBA SOP 50 10 8 modeling',     body: 'Model capital stacks under current SBA rules. Rebuild structures the new regulations broke.' },
  { title: 'Deal screening \u00b7 The Rundown', body: 'Score any deal in 90 seconds on seven dimensions. Pursue or pass before you spend a dollar.' },
  { title: 'CIM & pitch book drafting',    body: 'Institutional-quality Confidential Information Memorandums. 25\u201340 pages. Strategic narrative.' },
  { title: 'LOI & term sheet drafting',    body: 'First-draft offer documents from the deal context you\u2019ve built. Attorney-ready.' },
  { title: 'Investor memos & LP updates',  body: 'IC memos, LP updates, capital partner pitches, board decks. 20 minutes, not 2 days.' },
  { title: 'Due diligence coordination',   body: '147-item DD checklists generated from the specific deal. Cross-party status tracking. Document indexing.' },
];

const FAQS: readonly { q: string; a: string }[] = [
  { q: 'What\u2019s in the Free tier?',
    a: 'Unlimited chat with Yulia and one deliverable \u2014 ever \u2014 with email registration. No credit card. If you want a second deliverable, you either upgrade to Solo ($79/mo) or buy a $99 credit pack. No time limit on Free; the deliverable cap is total, not monthly.' },
  { q: 'What counts as a "deliverable"?',
    a: 'Any finished document Yulia produces \u2014 an add-back analysis, a CIM draft, a screening memo, an LOI, a deal summary, an LP update. One rendered, downloadable, or shareable artifact.' },
  { q: 'Why no success fees or take-rates?',
    a: 'Two reasons. First, smbX does not hold the licenses required to charge success fees \u2014 we sit on the software side of the broker-dealer line under SEC Rule 15(b)(13). Second, success fees would fundamentally change what smbX is: a tool becomes a broker, and we\u2019re not that. Subscription only. Forever.' },
  { q: 'What about advisors and brokers? Do you have a special tier?',
    a: 'Advisors and brokers are customers, not competitors. A solo broker uses Solo or Pro. A boutique advisory uses Team. A large middle-market firm uses Enterprise. Same product, different configuration. No separate pricing.' },
  { q: 'Can I try Pro or Team for free?',
    a: 'Yes \u2014 every paid tier has a 14-day full-feature trial. Credit card required to activate. Cancel inside 14 days and you\u2019re not charged.' },
  { q: 'What happens after I close a deal?',
    a: 'Your subscription continues at your current tier. You get 180 days of post-close PMI and portfolio ops support included. Many users stay on permanently \u2014 Yulia becomes the ongoing chief-of-staff for the business they bought.' },
  { q: 'Do you offer annual pricing?',
    a: 'Not at launch. We introduce annual (16% discount) after we\u2019ve earned it with retention data. Month-to-month, cancel anytime.' },
  { q: 'Why $199 Pro and $499 Team?',
    a: 'Pro is for one practitioner working alone \u2014 an independent sponsor, a solo banker, a searcher. Team is for a 2\u20135 person firm where Yulia becomes the shared team resource. The difference isn\u2019t features; it\u2019s seats, team workspace, and shared deal vault.' },
  { q: 'What if I need more than 5 seats?',
    a: 'That\u2019s Enterprise \u2014 $2,500/mo flat, covers 10 seats, SSO (Okta/Google/Azure), single-tenant deployment option, SOC 2 Type II audit trails, named account manager, 99.9% SLA, and API access.' },
  { q: 'Is there a student discount?',
    a: 'Yes. Students in M&A or ETA programs at accredited universities can apply for 50% off Pro for the duration of enrollment. Verify via .edu email; manually approved.' },
  { q: 'Can I pause my subscription?',
    a: 'Yes. You can pause for up to 90 days once per year. Pausing preserves your deal history and workspace. After 90 days, auto-resumes or auto-cancels based on your preference.' },
];

export default function Pricing({ onSend, onStartFree }: Props) {
  return (
    <Page onStartFree={onStartFree}>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <Section>
        <div className="gg-eyebrow" style={{ marginBottom: 16 }}>Pricing</div>
        <h1 className="gg-h1" style={{ marginBottom: 22 }}>One price. Every capability. Every deal size.</h1>
        <Body lead style={{ maxWidth: 720 }}>
          No feature gates. No success fees. No per-deal charges. Pick the tier that matches your team &mdash; every tier does every job.
        </Body>
      </Section>

      {/* ─── Philosophy ────────────────────────────────────────────── */}
      <Section variant="tint" label="The philosophy">
        <H2>Every tier includes everything Yulia does.</H2>
        <Body>
          You don\u2019t pay extra to unlock the valuation. You don\u2019t pay extra to unlock the CIM. The deal scoring, the capital stack modeling, the SBA structure work, the investor memos, the LOIs, the integration plans &mdash; it\u2019s all in every paid tier.
        </Body>
        <Body>
          Tiers scale on deal volume, seats, and enterprise infrastructure. Never on what Yulia can do for the deal in front of you.
        </Body>
        <Body>
          We do this because the alternative &mdash; charging more to unlock the feature you actually need &mdash; turns a tool into a negotiation. That\u2019s not the business we want. When you\u2019re working a deal, you shouldn\u2019t be thinking about whether the next step costs extra.
        </Body>
        <Body>One subscription. Everything included. Cancel anytime.</Body>
      </Section>

      {/* ─── Tier grid ─────────────────────────────────────────────── */}
      <Section>
        <H2>Choose based on who you are, not what your deals look like.</H2>
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {TIERS.map(t => (
            <Card
              key={t.key}
              style={{
                padding: 24,
                borderColor: t.highlighted ? 'var(--gg-text-primary)' : undefined,
                borderWidth: t.highlighted ? 1 : undefined,
                position: 'relative',
              }}
            >
              {t.highlighted && (
                <div style={{
                  position: 'absolute', top: -10, right: 20,
                  background: 'var(--gg-accent)', color: '#fff',
                  fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 'var(--gg-r-pill)',
                }}>
                  Most chosen
                </div>
              )}
              <div className="gg-label" style={{ marginBottom: 8 }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em' }}>{t.price}</span>
                <span style={{ fontFamily: 'var(--gg-body)', fontSize: 13, color: 'var(--gg-text-muted)' }}>{t.priceSuffix}</span>
              </div>
              <p className="gg-body" style={{ fontSize: 13, marginBottom: 20, minHeight: 60 }}>{t.who}</p>
              <button
                type="button"
                className={`gg-btn${t.highlighted ? ' gg-btn--primary' : ' gg-btn--ghost'}`}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  if (t.key === 'enterprise') {
                    onSend('I\u2019m interested in Enterprise. Here\u2019s what our team is solving: ');
                  } else if (t.key === 'free') {
                    onStartFree();
                  } else {
                    onSend(`I want to start on ${t.name} (${t.price}${t.priceSuffix}).`);
                  }
                }}
              >
                {t.cta}
              </button>
            </Card>
          ))}
        </div>
        <p className="gg-body" style={{ marginTop: 24, fontSize: 13, color: 'var(--gg-text-muted)' }}>
          Every paid tier has a 14-day opt-out trial. Credit card required to activate. Cancel inside 14 days and you\u2019re not charged.
        </p>
      </Section>

      {/* ─── Comparison table ──────────────────────────────────────── */}
      <Section variant="tint" label="Full comparison">
        <H2>Compare every feature.</H2>
        <div style={{ marginTop: 28, overflowX: 'auto', borderRadius: 'var(--gg-r-card-s)', border: '0.5px solid var(--gg-border)', background: 'var(--gg-bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--gg-body)', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--gg-bg-subtle)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 12, letterSpacing: '0.04em' }}>Feature</th>
                {TIERS.map(t => (
                  <th key={t.key} style={{ padding: '14px 12px', textAlign: 'center', fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 12 }}>
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr key={i} style={{ borderTop: '0.5px solid var(--gg-border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gg-text-secondary)' }}>{row.feature}</td>
                  {TIERS.map(t => (
                    <td key={t.key} style={{ padding: '12px 12px', textAlign: 'center', fontSize: 13, fontWeight: typeof row.values[t.key] === 'string' ? 600 : 400, color: row.values[t.key] === false ? 'var(--gg-text-faint)' : 'var(--gg-text-primary)' }}>
                      {row.values[t.key] === true ? '\u2713'
                        : row.values[t.key] === false ? '\u2014'
                        : row.values[t.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── 7 capability cards ────────────────────────────────────── */}
      <Section label="In every paid tier">
        <H2>What Yulia does for every subscription.</H2>
        <Body lead style={{ maxWidth: 720, marginBottom: 28 }}>
          These seven things ship in every paid tier &mdash; from Solo at $79 to Enterprise. The tier you pick controls volume and seats, not capability.
        </Body>
        <CardGrid minCol={240}>
          {CAPABILITY_CARDS.map(c => (
            <Card key={c.title}>
              <h3 className="gg-h3" style={{ marginBottom: 8 }}>{c.title}</h3>
              <p className="gg-body" style={{ marginBottom: 0, fontSize: 14 }}>{c.body}</p>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ─── FAQ ───────────────────────────────────────────────────── */}
      <Section variant="tint" label="FAQ">
        <H2>Questions.</H2>
        <div style={{ marginTop: 28 }}>
          {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
        </div>
      </Section>

      {/* ─── Bottom CTA ────────────────────────────────────────────── */}
      <BottomCta
        heading="Start free. No credit card."
        subhead="Unlimited chat. One deliverable free. Upgrade only when you know it\u2019s worth it."
        chatPlaceholder="Tell Yulia about your deal\u2026"
        onSend={onSend}
      />
    </Page>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '0.5px solid var(--gg-border)' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left',
          padding: '18px 0',
          background: 'transparent', border: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 17,
          color: 'var(--gg-text-primary)',
        }}
      >
        {q}
        <span style={{ fontSize: 18, color: 'var(--gg-text-muted)', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 200ms var(--gg-ease-snap)' }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 0 22px', fontSize: 14, lineHeight: 1.65, color: 'var(--gg-text-secondary)', maxWidth: 760 }}>
          {a}
        </div>
      )}
    </div>
  );
}
