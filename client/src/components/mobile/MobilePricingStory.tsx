/**
 * MobilePricingStory — mobile-native rendering of /pricing.
 *
 * Fibonacci layout. Vertical 6-tier ladder (Free / Single / Multi / Team /
 * Firm / Institutional) with the Multi-deal tier elevated as the "sweet
 * spot" highlight. Service-pros-free policy as an honest callout, not a
 * phantom tier. Pink accent.
 */

import { bridgeToYulia, goToChat } from '../content/chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { MobileJourneyStory } from './MobileJourneyStory';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  dark: boolean;
}

type Tier = {
  key: string;
  name: string;
  price: string;
  sub: string;
  protagonist: string;
  features: string[];
  cta: string;
  ctaPlan?: string;
  hero?: boolean;
};

const TIERS: Tier[] = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    sub: 'Forever',
    protagonist: 'Everyone starts here',
    features: [
      'Unlimited Yulia conversation',
      'One full deliverable, yours to keep',
      'Real Baseline range, 7-factor readiness',
    ],
    cta: 'Start free',
  },
  {
    key: 'single',
    name: 'Single deal',
    price: '$49',
    sub: '/mo · one active deal',
    protagonist: 'Your first close',
    features: [
      'SDE & EBITDA normalization',
      'Deal scoring + SBA eligibility',
      'Sector comps + benchmarks',
      'PDF exports with your name',
    ],
    cta: 'Start for $49',
  },
  {
    key: 'multi',
    name: 'Multi-deal',
    price: '$199',
    sub: '/mo · unlimited deals',
    protagonist: 'Market sweet spot',
    hero: true,
    features: [
      'Unlimited Baseline, Rundown™, stack models',
      'CIM generation from verified financials',
      'Blind Equity™ add-back schedule',
      '180-day post-close plans',
      'Document state machine · sign-off chain',
      'All 10 interactive financial models',
    ],
    cta: 'Start Multi-deal',
  },
  {
    key: 'team',
    name: 'Team',
    price: '$399',
    sub: '/mo · up to 5 seats',
    protagonist: 'Small teams & indie sponsors',
    features: [
      'Everything in Multi-deal × 5 seats',
      'Multi-deal portfolio view',
      'White-label outputs (your brand)',
      'Up to 10 active deals',
      'Priority email support',
    ],
    cta: 'Start Team',
  },
  {
    key: 'firm',
    name: 'Firm',
    price: '$1,999',
    sub: '/mo · unlimited seats',
    protagonist: 'Advisory firms & small PE',
    features: [
      'Unlimited users + unlimited deals',
      'Single sign-on (SAML)',
      'Dedicated onboarding',
      'SOC 2 report + contract terms',
      'Quarterly business review',
    ],
    cta: 'Start Firm',
    ctaPlan: 'firm',
  },
  {
    key: 'inst',
    name: 'Institutional',
    price: '$6,999',
    sub: '/mo · $1B+ funds',
    protagonist: 'Full stack · SLA · API',
    features: [
      'Unlimited users + unlimited deals',
      'SSO / SAML + advanced RBAC',
      'Full API + webhooks',
      'Dedicated CSM + priority engineering',
      'Custom SLA + white-glove onboarding',
    ],
    cta: 'Start Institutional',
    ctaPlan: 'institutional',
  },
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
    faqs: [
      {
        question: 'Why these prices? What are you benchmarking against?',
        answer:
          'AI-native knowledge-work products — Harvey ($100-200/seat), Hebbia ($300-400/seat), Rilla ($200/rep), Spellbook ($150/seat). We\u2019re in that band for individuals and teams, deliberately under the legacy M&A stack (DealCloud, Intapp — $30k+/yr minimums).',
      },
      {
        question: "I'm an attorney or CPA on my client's deal. What do I pay?",
        answer:
          "Nothing. Service professionals run free on any deal workflow their client brings them onto — it's your client's deal, not your book.",
      },
      {
        question: 'Why publish every price?',
        answer:
          'Because hiding the Institutional price is what the incumbents do, and we\u2019re not that. Every tier published. Every feature delta published. Sales calls should close sales, not reveal prices.',
      },
    ],
  });

  const accent = dark ? PINK_DARK : PINK;
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const cardBg = dark ? '#1a1c1e' : '#ffffff';
  const headingC = headingColor;

  const handleCTA = (plan?: string) => {
    if (plan === 'firm') {
      bridgeToYulia("I'd like to set up the Firm plan ($1,999/mo) for our team.");
    } else if (plan === 'institutional') {
      bridgeToYulia("I'd like to set up the Institutional plan ($6,999/mo).");
    } else {
      goToChat();
    }
  };

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
          <strong style={{ color: headingColor }}>Everyone starts free.</strong>{' '}
          When Yulia is doing the work, pick the tier that fits. Six prices, all published. Cancel any time.
        </>
      }
      callout={
        <>
          <strong style={{ color: accent }}>6 tiers · all published.</strong>{' '}
          Annual = 2 months free on any paid tier.
        </>
      }

      primaryInteractiveLabel="Pick your tier"
      primaryInteractive={
        <div
          style={{
            padding: 0,
            background: 'transparent',
            fontFamily: 'Inter, system-ui',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TIERS.map((t) => (
              <TierCard
                key={t.key}
                tier={t}
                onClick={() => handleCTA(t.ctaPlan)}
                accent={accent}
                dark={dark}
                headingC={headingC}
                bodyC={bodyC}
                mutedC={mutedC}
                borderC={borderC}
                cardBg={cardBg}
              />
            ))}
          </div>
          <p
            style={{
              textAlign: 'center',
              marginTop: 12,
              fontSize: 12,
              color: mutedC,
              lineHeight: 1.5,
            }}
          >
            Annual billing on any paid tier:{' '}
            <strong style={{ color: headingC }}>2 months free</strong>.
          </p>
        </div>
      }

      story={{
        name: 'One subscription',
        role: 'Everything Yulia does · one flat rate',
        body: (
          <>
            Unlimited Baselines, deal scores, capital stacks, CIMs, 180-day plans, and all 10 interactive
            financial models. Attorneys, CPAs, appraisers, and wealth managers who join your deal run{' '}
            <strong style={{ color: accent }}>free</strong>. Annual billing gets two months free.
            No sales call. No multi-year lock-in.
          </>
        ),
        outcome: 'Start free · upgrade when it pays · cancel any time',
      }}

      kpis={[
        { value: '$49',    label: 'entry tier · paid · anyone can start' },
        { value: '$6,999', label: 'top tier · published · no sales call' },
        { value: 'Free',   label: 'service pros on someone else\u2019s deal' },
      ]}

      takeaway={<>Start free. Upgrade when Yulia saves you a week of work. Walk if she doesn't.</>}

      ctaLabel="Start free"
      ctaSub="No card · one full deliverable, yours to keep"
      onCTA={() => goToChat()}
    >
      {/* ─── Service pros free callout ─── */}
      <section style={{ padding: '14px 16px 22px' }}>
        <div
          style={{
            padding: '18px',
            borderRadius: 16,
            background: '#0f1012',
            color: '#f9f9fc',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'Inter, system-ui',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.2em',
              color: accent,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Service professionals · free · forever
          </p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f9f9fc', lineHeight: 1.15, marginBottom: 10 }}>
            On someone else's deal?{' '}
            <span style={{ color: accent }}>Yulia is free for you.</span>
          </p>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(218,218,220,0.85)', lineHeight: 1.5, marginBottom: 12 }}>
            Attorneys, CPAs, real-estate brokers, wealth managers, appraisers, RWI brokers, estate planners — free on
            any deal workflow your client brings you onto. Full feature access, white-label outputs.
          </p>
          <button
            type="button"
            onClick={() => bridgeToYulia("I'm a deal professional. I'd like to use Yulia for my client work.")}
            className="cta-press"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 999,
              background: accent,
              color: '#fff',
              border: 'none',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Tell Yulia what you do
          </button>
        </div>
      </section>

    </MobileJourneyStory>
  );
}

/* ───────── Subcomponents ───────── */

function TierCard({
  tier, onClick, accent, dark, headingC, bodyC, mutedC, borderC, cardBg,
}: {
  tier: Tier;
  onClick: () => void;
  accent: string;
  dark: boolean;
  headingC: string;
  bodyC: string;
  mutedC: string;
  borderC: string;
  cardBg: string;
}) {
  const isHero = tier.hero;
  return (
    <div
      style={{
        padding: '18px',
        borderRadius: 14,
        background: isHero ? (dark ? '#1f1416' : '#fef0f4') : cardBg,
        border: isHero ? `2px solid ${accent}` : `1px solid ${borderC}`,
        fontFamily: 'Inter, system-ui',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.16em',
          color: accent,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {isHero ? 'Most chosen · market sweet spot' : tier.protagonist}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <p style={{ margin: 0, fontFamily: 'Sora, system-ui', fontSize: 22, fontWeight: 900, color: headingC, letterSpacing: '-0.02em' }}>
          {tier.name}
        </p>
        <p style={{ margin: 0, fontFamily: 'Sora, system-ui', fontSize: 22, fontWeight: 900, color: isHero ? accent : headingC, letterSpacing: '-0.01em' }}>
          {tier.price}
          <span style={{ fontSize: 11, fontWeight: 600, color: mutedC, marginLeft: 4 }}>{tier.sub}</span>
        </p>
      </div>
      <ul style={{ margin: '8px 0 12px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {tier.features.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 13, color: accent, marginTop: 3, flexShrink: 0 }}>
              check
            </span>
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
          padding: '10px',
          borderRadius: 999,
          background: isHero ? accent : 'transparent',
          color: isHero ? '#fff' : headingC,
          border: isHero ? 'none' : `1.5px solid ${borderC}`,
          fontSize: 12.5,
          fontWeight: 800,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        {tier.cta}
      </button>
    </div>
  );
}

