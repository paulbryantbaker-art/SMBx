/**
 * MobilePricingStory — mobile-native rendering of /pricing.
 *
 * Vertical 5-tier ladder with inheritance ("Everything in X, plus..."),
 * compact 3-stop cost comparison, FAQ accordion, and service-pros callout
 * demoted to a one-line policy strip. Annual billing deferred to month 3–6.
 */

import { useState } from 'react';
import { bridgeToYulia } from '../content/chatBridge';
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

type TierKey = 'free' | 'solo' | 'pro' | 'team' | 'enterprise';

type Tier = {
  key: TierKey;
  name: string;
  monthly: number;
  priceSuffix: string;
  eyebrow?: string;
  inherits?: TierKey;
  deltaFeatures: string[];
  hero?: boolean;
};

const TIERS: Tier[] = [
  {
    key: 'free',
    name: 'Free',
    monthly: 0,
    priceSuffix: 'forever',
    eyebrow: 'Meet Yulia',
    deltaFeatures: [
      'Unlimited Yulia conversation',
      'One full deliverable \u2014 ever',
      'Every hero capability',
      'Email required \u00b7 no card',
    ],
  },
  {
    key: 'solo',
    name: 'Solo',
    monthly: 79,
    priceSuffix: '/mo',
    eyebrow: 'Solo operators',
    inherits: 'free',
    deltaFeatures: [
      'One active deal',
      'Unlimited deliverables',
      'Post-close / PMI workflows',
      '14-day free trial',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    monthly: 199,
    priceSuffix: '/mo',
    eyebrow: 'Most chosen',
    hero: true,
    inherits: 'solo',
    deltaFeatures: [
      'Unlimited active deals, in parallel',
      'Full deal pipeline & CRM',
      'Every add-back, memo, CIM',
      'No hero capability gated \u2014 ever',
    ],
  },
  {
    key: 'team',
    name: 'Team',
    monthly: 499,
    priceSuffix: '/mo \u00b7 5 seats',
    eyebrow: 'Small teams',
    inherits: 'pro',
    deltaFeatures: [
      'Up to 5 seats, under Pro per-seat',
      'Shared team workspace',
      'Shared deal vault',
      'Collaborate on every doc',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    monthly: 2500,
    priceSuffix: '/mo \u00b7 6+ seats',
    eyebrow: 'Firms & funds',
    inherits: 'team',
    deltaFeatures: [
      '6+ seats',
      'SSO (Okta, Google, Azure)',
      'Single-tenant option',
      'SOC 2 Type II audit trails',
      '99.9% SLA \u00b7 API access',
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is there really a free tier?',
    a: 'Yes. Unlimited Yulia chat plus one deliverable \u2014 ever. Email required. No card. A $99 credit pack is available if you want a second deliverable without committing.',
  },
  {
    q: 'Which tier should I start with?',
    a: 'Running parallel deals? Pro ($199). Solo operator or first-time buyer? Solo ($79). A 2\u20135 person firm? Team ($499). Bigger than that? Enterprise ($2,500). Move up or down any time.',
  },
  {
    q: 'Are hero capabilities gated?',
    a: "No. Every add-back, every CIM, every LOI, every memo \u2014 available on every paid tier. You pay for deal volume, seats, and enterprise infrastructure. Never for Yulia's work.",
  },
  {
    q: 'What does my attorney or CPA pay?',
    a: "Nothing. Service professionals run free on any deal their client brings them onto. Full access, on your deal workflow.",
  },
  {
    q: 'Does Yulia take a success fee?',
    a: 'No. Flat-rate subscription, period. Never a percentage of a transaction. Ever.',
  },
];

/* Cost comparison stops — mobile equivalent of the desktop DealCostMap.
   Team cost scales with deal complexity; Yulia tier also scales (Pro for
   solo operators and mid-market, Enterprise for advisory/PE at $1B+). Numbers
   derived from the same piecewise model in DealCostMap.tsx. */
const COST_STOPS: {
  ev: string;
  ib: string;
  team: string;
  teamShape: string;
  yulia: string;
  yuliaTier: string;
  spread: string;
}[] = [
  {
    ev: '$10M',
    ib: '~$310K',
    team: '~$400K/yr',
    teamShape: 'Solo banker + 1 analyst',
    yulia: '$2,388/yr',
    yuliaTier: 'Pro',
    spread: '~130\u00d7',
  },
  {
    ev: '$100M',
    ib: '~$2.0M',
    team: '~$1.1M/yr',
    teamShape: 'VP + 1 associate + 2 analysts',
    yulia: '$2,388/yr',
    yuliaTier: 'Pro',
    spread: '~840\u00d7',
  },
  {
    ev: '$1B',
    ib: '~$11.75M',
    team: '~$1.7M/yr',
    teamShape: 'VP + 2 associates + 2 analysts',
    yulia: '$30,000/yr',
    yuliaTier: 'Enterprise',
    spread: '~390\u00d7',
  },
];

export default function MobilePricingStory({ dark }: Props) {
  usePageMeta({
    title: 'Priced against the cost of building it yourself. \u00b7 smbx.ai pricing',
    description:
      "Five published prices. Free, $79 Solo, $199 Pro, $499 Team, $2,500 Enterprise. Every tier includes every capability. No success fees, ever. Service pros on someone else's deal run free.",
    canonical: 'https://smbx.ai/pricing',
    ogImage: 'https://smbx.ai/og-pricing.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Pricing', url: 'https://smbx.ai/pricing' },
    ],
    faqs: FAQS.map((f) => ({ question: f.q, answer: f.a })),
  });

  const [stop, setStop] = useState(1); // default $100M

  const accent = dark ? PINK_DARK : PINK;
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';
  const ruleC = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';

  const tierByKey = (k: TierKey) => TIERS.find((t) => t.key === k)!;

  const displayPrice = (t: Tier) => {
    if (t.monthly === 0) return { main: '$0', sub: t.priceSuffix };
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
          <span className="block">Priced against the cost</span>
          <span className="block">of <em className="not-italic" style={{ color: accent }}>building it yourself</em>.</span>
        </>
      }
      sub={
        <>
          Not against the cost of not having it. <strong style={{ color: headingC }}>Every tier includes every capability.</strong>{' '}
          You pay for deal volume, seats, and enterprise infrastructure. Never for Yulia&rsquo;s work.
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
            <CostRow label="In-house analyst team" value={cost.team} sub={`${cost.teamShape}, loaded`} headingC={headingC} mutedC={mutedC} bodyC={bodyC} ruleC={ruleC} />
            <CostRow label="Run Yulia" value={cost.yulia} sub={`${cost.yuliaTier} tier · flat at this deal size`} accentBg={accent} isAccent headingC={headingC} mutedC={mutedC} bodyC={bodyC} ruleC={ruleC} />
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
      {/* ─── "Let Yulia pick" — the action the page actually wants ─── */}
      <section style={{ padding: '2px 16px 14px' }}>
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: dark ? 'rgba(232,112,154,0.08)' : 'rgba(212,74,120,0.06)',
            border: `1px solid ${dark ? 'rgba(232,112,154,0.25)' : 'rgba(212,74,120,0.2)'}`,
            fontFamily: 'Inter, system-ui',
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: accent, marginBottom: 6 }}>
            The short version
          </p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: headingC }}>
            <strong>You don’t pick. Yulia picks.</strong>{' '}
            <span style={{ color: bodyC }}>
              Start chat. She asks a few questions, reads your deal, tells you the tier. Move up or down any time.
            </span>
          </p>
          <button
            type="button"
            onClick={() => bridgeToYulia('What tier should I be on? Here’s what I’m working on: ')}
            className="cta-press"
            style={{
              marginTop: 12,
              width: '100%',
              padding: 12,
              borderRadius: 999,
              background: accent,
              color: '#fff',
              border: 'none',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'inherit',
              cursor: 'pointer',
              boxShadow: `0 10px 30px -12px ${accent}aa`,
            }}
          >
            Let Yulia pick →
          </button>
        </div>
      </section>

      {/* ─── Tier ladder — informational only. No per-tier CTAs. ─── */}
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
  tier, prevName, priceMain, priceSub, accent, dark, headingC, bodyC, mutedC, borderC, ruleC, cardBg,
}: {
  tier: Tier;
  prevName?: string;
  priceMain: string;
  priceSub: string;
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

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {tier.deltaFeatures.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Check color={accent} />
            <span style={{ fontSize: 13, color: bodyC, lineHeight: 1.4 }}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
