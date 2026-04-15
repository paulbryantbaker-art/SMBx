/**
 * MobilePricingStory — mobile-native rendering of /pricing.
 *
 * Vertical 6-tier ladder with inheritance ("Everything in X, plus..."),
 * annual/monthly toggle, compact 3-stop cost comparison, FAQ accordion,
 * and service-pros callout demoted to a one-line policy strip.
 */

import { useState } from 'react';
import { bridgeToYulia, goToChat } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { MobileJourneyStory } from './MobileJourneyStory';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  dark: boolean;
}

/* Inline SVG check — no Material Symbols slop. */
function Check({ color, size = 13 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <path
        d="M3 8.5L6.5 12L13 4.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type TierKey = 'free' | 'single' | 'multi' | 'team' | 'firm' | 'inst';

type Tier = {
  key: TierKey;
  name: string;
  monthly: number;
  annual: number;
  priceSuffix: string;
  eyebrow?: string;
  inherits?: TierKey;
  deltaFeatures: string[];
  cta: string;
  ctaPlan?: string;
  hero?: boolean;
};

const TIERS: Tier[] = [
  {
    key: 'free',
    name: 'Free',
    monthly: 0,
    annual: 0,
    priceSuffix: 'forever',
    eyebrow: 'Start here',
    deltaFeatures: [
      'Unlimited Yulia conversation',
      'One full deliverable, yours to keep',
      'Real Baseline range, 7-factor readiness',
    ],
    cta: 'Start free',
  },
  {
    key: 'single',
    name: 'Single deal',
    monthly: 49,
    annual: 490,
    priceSuffix: '/mo',
    eyebrow: 'Your first close',
    inherits: 'free',
    deltaFeatures: [
      'One active deal',
      'SDE & EBITDA normalization',
      'Deal scoring + SBA eligibility',
      'Sector comps + benchmarks',
      'PDF exports with your name',
    ],
    cta: 'Start Single',
  },
  {
    key: 'multi',
    name: 'Multi-deal',
    monthly: 199,
    annual: 1990,
    priceSuffix: '/mo',
    eyebrow: 'Most chosen',
    hero: true,
    inherits: 'single',
    deltaFeatures: [
      'Unlimited active deals',
      'CIM generation',
      'Blind Equity™ add-backs',
      '180-day post-close plans',
      'All 10 financial models',
      'Full deal room',
    ],
    cta: 'Start Multi-deal',
  },
  {
    key: 'team',
    name: 'Team',
    monthly: 399,
    annual: 3990,
    priceSuffix: '/mo · 5 seats',
    eyebrow: 'Small teams & indie sponsors',
    inherits: 'multi',
    deltaFeatures: [
      '5 seats included',
      'Portfolio view',
      'White-label outputs',
      'Up to 10 active deals',
      'Priority email support',
    ],
    cta: 'Start Team',
  },
  {
    key: 'firm',
    name: 'Firm',
    monthly: 1999,
    annual: 19990,
    priceSuffix: '/mo · unlimited seats',
    eyebrow: 'Advisory firms & small PE',
    inherits: 'team',
    deltaFeatures: [
      'Unlimited seats + deals',
      'SSO (SAML)',
      'Dedicated onboarding',
      'SOC 2 + contract terms',
      'Quarterly business review',
    ],
    cta: 'Start Firm',
    ctaPlan: 'firm',
  },
  {
    key: 'inst',
    name: 'Institutional',
    monthly: 6999,
    annual: 69990,
    priceSuffix: '/mo',
    eyebrow: '$1B+ funds · bulge bracket',
    inherits: 'firm',
    deltaFeatures: [
      'Advanced RBAC',
      'Full API + webhooks',
      'Dedicated CSM',
      'Custom SLA',
      'White-glove onboarding',
    ],
    cta: 'Start Institutional',
    ctaPlan: 'institutional',
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is there really a free tier?',
    a: 'Yes. Unlimited Yulia chat plus one full deliverable, yours to keep. Email required after the first deliverable. No card.',
  },
  {
    q: 'Which tier should I start with?',
    a: 'Running more than one deal at a time? Multi-deal ($199). First close? Single deal ($49). Small team? Team. Firm? Firm. $1B+ fund? Institutional. Move up or down any time.',
  },
  {
    q: "What does my attorney or CPA pay?",
    a: "Nothing. Service professionals run free on any deal their client brings them onto. Full access, white-label outputs.",
  },
  {
    q: 'Can I cancel?',
    a: 'Any time. No multi-year lock-in on any tier.',
  },
  {
    q: 'Does Yulia take a success fee?',
    a: 'No. Flat-rate subscription, period. Never a percentage of a transaction.',
  },
];

/* Cost comparison stops — mobile equivalent of the desktop DealCostMap. */
const COST_STOPS: { ev: string; ib: string; team: string; yulia: string; spread: string }[] = [
  { ev: '$10M',  ib: '~$225K',  team: '$1.7M/yr', yulia: '$2,388/yr', spread: '~94×' },
  { ev: '$100M', ib: '~$1.85M', team: '$1.7M/yr', yulia: '$2,388/yr', spread: '~775×' },
  { ev: '$1B',   ib: '~$8.5M',  team: '$1.7M/yr', yulia: '$2,388/yr', spread: '~3,560×' },
];

export default function MobilePricingStory({ dark }: Props) {
  usePageMeta({
    title: 'Priced fairly. Every tier published. · smbx.ai pricing',
    description:
      'AI in a harness, priced like software — not like a law firm. Six tiers from Free to Institutional, all published, none hidden. Service professionals run free on any deal.',
    canonical: 'https://smbx.ai/pricing',
    ogImage: 'https://smbx.ai/og-pricing.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Pricing', url: 'https://smbx.ai/pricing' },
    ],
    faqs: FAQS.map((f) => ({ question: f.q, answer: f.a })),
  });

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [stop, setStop] = useState(1); // default $100M

  const accent = dark ? PINK_DARK : PINK;
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';
  const ruleC = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';

  const handleCTA = (plan?: string) => {
    if (plan === 'firm') {
      bridgeToYulia("I'd like to set up the Firm plan ($1,999/mo) for our team.");
    } else if (plan === 'institutional') {
      bridgeToYulia("I'd like to set up the Institutional plan ($6,999/mo).");
    } else {
      goToChat();
    }
  };

  const tierByKey = (k: TierKey) => TIERS.find((t) => t.key === k)!;

  const displayPrice = (t: Tier) => {
    if (t.monthly === 0) return { main: '$0', sub: t.priceSuffix };
    if (billing === 'annual') {
      return {
        main: `$${Math.round(t.annual / 12).toLocaleString()}`,
        sub: `${t.priceSuffix} · billed $${t.annual.toLocaleString()}/yr`,
      };
    }
    return { main: `$${t.monthly.toLocaleString()}`, sub: t.priceSuffix };
  };

  const cost = COST_STOPS[stop];

  return (
    <MobileJourneyStory
      dark={dark}
      journey="brand"
      eyebrow="Pricing"
      headline={
        <>
          Close faster.<br />
          Pay <em className="not-italic" style={{ color: accent }}>less</em> doing it.
        </>
      }
      sub={
        <>
          <strong style={{ color: headingC }}>Everyone starts free.</strong>{' '}
          Six prices, all published. Cancel any time. Service pros on someone else’s deal run free.
        </>
      }

      primaryInteractiveLabel="The math"
      primaryInteractive={
        <div style={{ fontFamily: 'Inter, system-ui' }}>
          {/* Stops picker */}
          <div
            role="tablist"
            aria-label="Deal size"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
              padding: 4,
              borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)',
              border: `1px solid ${borderC}`,
              marginBottom: 14,
            }}
          >
            {COST_STOPS.map((s, i) => {
              const active = i === stop;
              return (
                <button
                  key={s.ev}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStop(i)}
                  style={{
                    padding: '8px 0',
                    borderRadius: 999,
                    background: active ? (dark ? '#f9f9fc' : '#0f1012') : 'transparent',
                    color: active ? (dark ? '#0f1012' : '#f9f9fc') : mutedC,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {s.ev}
                </button>
              );
            })}
          </div>

          {/* Three-row cost strip */}
          <div
            style={{
              borderRadius: 14,
              background: cardBg,
              border: `1px solid ${borderC}`,
              overflow: 'hidden',
            }}
          >
            <CostRow label="Investment bank" value={cost.ib} sub="one-time success fee" headingC={headingC} mutedC={mutedC} bodyC={bodyC} ruleC={ruleC} />
            <CostRow label="In-house analyst team" value={cost.team} sub="VP + 2 associates + 2 analysts, loaded" headingC={headingC} mutedC={mutedC} bodyC={bodyC} ruleC={ruleC} />
            <CostRow label="Run Yulia" value={cost.yulia} sub="Multi-deal · flat · unlimited deals" accentBg={accent} isAccent headingC={headingC} mutedC={mutedC} bodyC={bodyC} ruleC={ruleC} />
          </div>

          {/* Spread headline */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: mutedC }}>
              Spread vs IB
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontFamily: 'Sora, system-ui',
                fontSize: 44,
                fontWeight: 900,
                color: accent,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {cost.spread}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: bodyC, lineHeight: 1.4 }}>
              Yulia is flat-rate software, not a broker-dealer. For closings you still want bankers and lawyers.
            </p>
          </div>
        </div>
      }

      story={{
        name: 'One subscription',
        role: 'Everything Yulia does · one flat rate',
        body: (
          <>
            Unlimited Baselines, deal scores, capital stacks, CIMs, 180-day plans, and all 10 interactive
            financial models. Attorneys, CPAs, appraisers, and wealth managers who join your deal run{' '}
            <strong style={{ color: accent }}>free</strong>. No sales call. No multi-year lock-in.
          </>
        ),
        outcome: 'Start free · upgrade when it pays · cancel any time',
      }}

      takeaway={<>Start free. Upgrade when the work pays off.</>}
    >
      {/* ─── Annual/Monthly toggle ─── */}
      <section style={{ padding: '8px 16px 12px' }}>
        <div
          role="tablist"
          aria-label="Billing period"
          style={{
            display: 'inline-flex',
            padding: 4,
            borderRadius: 999,
            background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)',
            border: `1px solid ${borderC}`,
            margin: '0 auto',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {(['monthly', 'annual'] as const).map((opt) => {
            const active = billing === opt;
            return (
              <button
                key={opt}
                role="tab"
                aria-selected={active}
                onClick={() => setBilling(opt)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: active ? (dark ? '#f9f9fc' : '#0f1012') : 'transparent',
                  color: active ? (dark ? '#0f1012' : '#f9f9fc') : mutedC,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'Inter, system-ui',
                  cursor: 'pointer',
                }}
              >
                {opt === 'monthly' ? 'Monthly' : 'Annual'}
                {opt === 'annual' && (
                  <span style={{ marginLeft: 6, fontSize: 10, color: accent, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 800 }}>
                    2 mo free
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Tier ladder ─── */}
      <section style={{ padding: '6px 16px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TIERS.map((t) => {
            const prev = t.inherits ? tierByKey(t.inherits) : null;
            const { main, sub } = displayPrice(t);
            return (
              <TierCard
                key={t.key}
                tier={t}
                prevName={prev?.name}
                priceMain={main}
                priceSub={sub}
                onClick={() => handleCTA(t.ctaPlan)}
                accent={accent}
                dark={dark}
                headingC={headingC}
                bodyC={bodyC}
                mutedC={mutedC}
                borderC={borderC}
                ruleC={ruleC}
                cardBg={cardBg}
              />
            );
          })}
        </div>
      </section>

      {/* ─── Service pros policy strip (demoted from second hero) ─── */}
      <section style={{ padding: '6px 16px 18px' }}>
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: cardBg,
            border: `1px solid ${borderC}`,
            fontFamily: 'Inter, system-ui',
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: accent, marginBottom: 6 }}>
            Policy · service professionals
          </p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: headingC }}>
            <strong>On someone else’s deal? Yulia is free for you.</strong>{' '}
            <span style={{ color: bodyC }}>
              Attorneys, CPAs, brokers, appraisers, wealth managers — full access, white-label, no seat fee.
            </span>
          </p>
          <button
            type="button"
            onClick={() => bridgeToYulia("I'm a deal professional. I'd like to use Yulia for my client work.")}
            className="cta-press"
            style={{
              marginTop: 12,
              width: '100%',
              padding: 11,
              borderRadius: 999,
              background: 'transparent',
              color: accent,
              border: `1.5px solid ${accent}`,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Tell Yulia what you do →
          </button>
        </div>
      </section>

      {/* ─── FAQ accordion ─── */}
      <section style={{ padding: '6px 16px 22px' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: accent, marginBottom: 10 }}>
          Questions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="pricing-accordion"
              style={{
                borderRadius: 12,
                background: cardBg,
                border: `1px solid ${borderC}`,
                overflow: 'hidden',
                fontFamily: 'Inter, system-ui',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: headingC, lineHeight: 1.3 }}>
                  {f.q}
                </span>
                <span
                  aria-hidden
                  style={{ fontSize: 18, color: accent, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}
                >
                  +
                </span>
              </summary>
              <div
                style={{
                  padding: '4px 14px 14px',
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: bodyC,
                  borderTop: `1px solid ${ruleC}`,
                }}
              >
                <p style={{ margin: '12px 0 0' }}>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

    </MobileJourneyStory>
  );
}

/* ───────── Subcomponents ───────── */

function CostRow({
  label, value, sub, isAccent, accentBg, headingC, mutedC, bodyC, ruleC,
}: {
  label: string;
  value: string;
  sub: string;
  isAccent?: boolean;
  accentBg?: string;
  headingC: string;
  mutedC: string;
  bodyC: string;
  ruleC: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderBottom: isAccent ? 'none' : `1px solid ${ruleC}`,
        background: isAccent ? accentBg : 'transparent',
        color: isAccent ? '#fff' : headingC,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: isAccent ? 'rgba(255,255,255,0.85)' : mutedC,
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: 'Sora, system-ui',
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: '-0.01em',
          color: isAccent ? '#fff' : headingC,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      <p
        style={{
          margin: '4px 0 0',
          fontSize: 12,
          color: isAccent ? 'rgba(255,255,255,0.78)' : bodyC,
          lineHeight: 1.4,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

function TierCard({
  tier, prevName, priceMain, priceSub, onClick, accent, dark, headingC, bodyC, mutedC, borderC, ruleC, cardBg,
}: {
  tier: Tier;
  prevName?: string;
  priceMain: string;
  priceSub: string;
  onClick: () => void;
  accent: string;
  dark: boolean;
  headingC: string;
  bodyC: string;
  mutedC: string;
  borderC: string;
  ruleC: string;
  cardBg: string;
}) {
  const isHero = !!tier.hero;
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 14,
        background: cardBg,
        border: isHero ? `2px solid ${accent}` : `1px solid ${borderC}`,
        fontFamily: 'Inter, system-ui',
      }}
    >
      {/* Eyebrow — subtle, low tracking */}
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: isHero ? accent : mutedC,
          marginBottom: 6,
        }}
      >
        {isHero ? 'Most chosen' : tier.eyebrow}
      </p>

      {/* Name — primary (stacked above price; never shares a row) */}
      <p
        style={{
          margin: 0,
          fontFamily: 'Sora, system-ui',
          fontSize: 22,
          fontWeight: 900,
          color: headingC,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {tier.name}
      </p>

      {/* Price — stacked below */}
      <div style={{ marginBottom: 12 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'Sora, system-ui',
            fontSize: 28,
            fontWeight: 900,
            color: headingC,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {priceMain}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: mutedC, lineHeight: 1.4 }}>
          {priceSub}
        </p>
      </div>

      {/* Inheritance line */}
      {prevName && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: bodyC,
            paddingBottom: 10,
            marginBottom: 8,
            borderBottom: `1px solid ${ruleC}`,
          }}
        >
          Everything in <strong style={{ color: headingC }}>{prevName}</strong>, plus:
        </p>
      )}

      <ul style={{ margin: '0 0 12px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {tier.deltaFeatures.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Check color={accent} />
            <span style={{ fontSize: 13, color: bodyC, lineHeight: 1.4 }}>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onClick}
        className="cta-press"
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 999,
          background: isHero ? accent : 'transparent',
          color: isHero ? '#fff' : headingC,
          border: isHero ? 'none' : `1.5px solid ${borderC}`,
          fontSize: 12.5,
          fontWeight: 800,
          fontFamily: 'inherit',
          cursor: 'pointer',
          boxShadow: isHero ? `0 8px 24px -12px ${accent}aa` : 'none',
        }}
      >
        {tier.cta}
      </button>
    </div>
  );
}
