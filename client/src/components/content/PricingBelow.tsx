import { goToChat, bridgeToYulia } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { DealCostMap } from './DealCostMap';
import {
  HookHeader,
  SectionHeader,
  PageCTA,
  SectionBand,
} from './storyBlocks';

/* Inline SVG check — avoids Material Symbols slop. */
function Check({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0, marginTop: 2 }}
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
  priceSuffix: string; // e.g., "forever" or "/mo"
  eyebrow?: string;    // small caption ABOVE price (never competes with name)
  inherits?: TierKey;  // what tier this builds on
  deltaFeatures: string[]; // only the delta from `inherits`; full list if no inheritance
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
      'Every hero capability available',
      'Email required \u00b7 no credit card',
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
      'One active deal at a time',
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
      'Every add-back, every memo, every CIM',
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
      'Collaborate on every document',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    monthly: 2500,
    priceSuffix: '/mo \u00b7 10 seats',
    eyebrow: 'Firms & funds',
    inherits: 'team',
    deltaFeatures: [
      '10 seats',
      'SSO (Okta, Google, Azure AD)',
      'Single-tenant deployment option',
      'SOC 2 Type II audit trails',
      'Named account manager \u00b7 99.9% SLA \u00b7 API access',
    ],
  },
];

/* Feature matrix for the comparison table (P0 fix — lets users diff tiers). */
type MatrixRow = { feature: string; values: Record<TierKey, string | boolean> };
const MATRIX: MatrixRow[] = [
  // ─── Usage — the only real differentiator between Free / Solo / Pro ───
  { feature: 'Deliverables',         values: { free: '1 total', solo: 'Unlimited', pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' } },
  { feature: 'Active deals',         values: { free: '1', solo: '1', pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' } },
  { feature: 'Seats',                values: { free: '1', solo: '1', pro: '1', team: '5', enterprise: '10' } },
  // ─── Hero capabilities — all ✓ on every paid tier, no gating ever ───
  { feature: 'Add-back / QoE Lite analysis',    values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Regulatory & structure modeling', values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Deal screening & triage',         values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'CIM / teaser drafting',           values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'LOI & term sheet drafting',       values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Due diligence coordination',      values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Investor memos & updates',        values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Deal pipeline & CRM',             values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Buyer list building',             values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Market & comp research',          values: { free: true, solo: true, pro: true, team: true, enterprise: true } },
  { feature: 'Post-close / PMI workflows',      values: { free: false, solo: true, pro: true, team: true, enterprise: true } },
  // ─── Team features ───
  { feature: 'Team workspace',       values: { free: false, solo: false, pro: false, team: true, enterprise: true } },
  { feature: 'Shared deal vault',    values: { free: false, solo: false, pro: false, team: true, enterprise: true } },
  // ─── Enterprise infrastructure ───
  { feature: 'SSO (Okta, Google, Azure)', values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'Single-tenant deployment',  values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'Audit trails',              values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'SOC 2 Type II',             values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'Named account manager',     values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'SLA (99.9% uptime)',        values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
  { feature: 'API access',                values: { free: false, solo: false, pro: false, team: false, enterprise: true } },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How much does smbx.ai cost?',
    a: 'Five tiers: Free, $79/mo Solo, $199/mo Pro, $499/mo Team (5 seats), $2,500/mo Enterprise (10 seats). Every price published. No success fees, no take-rate, ever.',
  },
  {
    q: 'What does the Free tier actually include?',
    a: 'Unlimited chat with Yulia and one deliverable \u2014 ever \u2014 with email registration. No credit card. If you want a second deliverable, you either upgrade to Solo ($79/mo) or buy a $99 credit pack. No time limit on Free; the deliverable cap is total, not monthly.',
  },
  {
    q: 'What counts as a "deliverable"?',
    a: 'Any finished document Yulia produces \u2014 an add-back analysis, a CIM draft, a screening memo, an LOI, a deal summary. One deliverable = one rendered, downloadable, or shareable artifact.',
  },
  {
    q: 'Are hero capabilities gated to higher tiers?',
    a: "No. Add-back analysis, CIM drafting, LOI drafting, investor memos, diligence coordination \u2014 every hero capability is available in every paid tier. You pay for deal volume, seat count, and enterprise infrastructure. Never for Yulia's work.",
  },
  {
    q: 'Why is Pro $199 but Team $499?',
    a: "Pro is for one practitioner working alone \u2014 an independent sponsor, a solo banker, a searcher. Team is for a 2\u20135 person firm where Yulia becomes the shared team resource. The difference isn't features; it's seats, team workspace, and shared deal vault.",
  },
  {
    q: 'What if I need more than 5 seats?',
    a: "That's Enterprise \u2014 $2,500/mo flat, covers 10 seats, SSO (Okta/Google/Azure), single-tenant deployment option, SOC 2 Type II audit trails, named account manager, 99.9% SLA, and API access.",
  },
  {
    q: 'Can I try Pro or Team for free?',
    a: "Yes \u2014 every paid tier has a 14-day full-feature trial. Credit card required to activate. Cancel anytime inside the 14 days and you're not charged.",
  },
  {
    q: 'What happens after I close a deal?',
    a: 'Your subscription continues at your current tier. Post-close PMI workflows, investor updates, and portfolio ops are built in. Many users stay on permanently \u2014 Yulia becomes the ongoing chief-of-staff for the business they bought.',
  },
  {
    q: 'Do you offer a discount for multi-year commitment?',
    a: 'Not at launch. Annual pricing (16% discount) gets introduced once retention is proven. Month-to-month, cancel anytime.',
  },
  {
    q: 'Why no success fees?',
    a: "Two reasons. First, smbX does not hold the licenses required to charge success fees \u2014 we sit on the software side of the broker-dealer line under SEC Rule 15(b)(13). Second, success fees would fundamentally change what smbX is: a tool becomes a broker, and we're not that. Subscription only. Forever.",
  },
  {
    q: 'What about advisors and brokers? Do you have a special tier?',
    a: 'Advisors and brokers are customers, not competitors. A solo broker uses Solo or Pro. A boutique advisory uses Team. A large middle-market advisory uses Enterprise. Same product, different configuration. No separate pricing.',
  },
  {
    q: 'What do my attorney or CPA pay to join my deal?',
    a: "Nothing. Service professionals (attorneys, CPAs, appraisers, wealth managers, estate planners) run free on any deal workflow you bring them onto. They're on your deal, not their own book.",
  },
];

export default function PricingBelow({ dark }: { dark: boolean }) {
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

  // Colors
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? '#E8709A' : '#D44A78';
  const cardBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const ruleColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';

  const tierByKey = (k: TierKey) => TIERS.find((t) => t.key === k)!;

  const displayPrice = (t: Tier) => {
    if (t.monthly === 0) return { main: '$0', sub: t.priceSuffix };
    return { main: `$${t.monthly.toLocaleString()}`, sub: t.priceSuffix };
  };

  return (
    <div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="pricing"
          headline={
            <>
              <span className="block">Priced against the cost</span>
              <span className="block">of <em className="not-italic" style={{ color: accent }}>building it yourself</em>.</span>
            </>
          }
          sub={
            <>
              Not against the cost of not having it. That&rsquo;s how everyone else prices. <strong style={{ color: headingColor }}>We don&rsquo;t.</strong>{' '}
              Every tier includes every capability — you pay for volume, seats, and enterprise infrastructure. Never for Yulia&rsquo;s work.
            </>
          }
          dark={dark}
        />

        {/* ═══ The Deal Cost Map — cinematic anchor (full-bleed immersive band) ═══ */}
        <SectionBand tone="immersive" dark={dark}>
          <SectionHeader
            label="The math"
            title="Three ways to pay for the same work."
            sub="Drag the deal size. The IB fee, the in-house analyst team cost, and the Yulia subscription all update live."
            dark={dark}
          />
          <DealCostMap dark={dark} />
        </SectionBand>

        {/* ═══ Tier cards ═══ */}
        <section className="mb-10">
          <SectionHeader
            label="The five tiers"
            title="Yulia picks the right one for you."
            sub="Tell her what you&rsquo;re working on &mdash; she reads your situation and routes you to the tier that fits. Every price published anyway, so you can sanity-check her pick."
            dark={dark}
          />

          {/* Primary CTA — "Let Yulia pick". This is the action the page wants.
              The tier cards below are information, not decisions. */}
          <div
            className="rounded-2xl p-5 md:p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{
              background: dark ? 'rgba(232,112,154,0.08)' : 'rgba(212,74,120,0.06)',
              border: `1px solid ${dark ? 'rgba(232,112,154,0.25)' : 'rgba(212,74,120,0.2)'}`,
            }}
          >
            <div className="flex-1">
              <p
                className="text-[11px] font-semibold mb-1"
                style={{ color: accent, letterSpacing: '0.06em' }}
              >
                The short version
              </p>
              <p className="text-[16px] md:text-[17px] leading-snug" style={{ color: headingColor }}>
                <strong>You don’t pick. Yulia picks.</strong>{' '}
                <span style={{ color: bodyColor }}>
                  Start the conversation. She asks a few questions, reads your deal, and tells you which tier fits.
                  Move up or down any time.
                </span>
              </p>
            </div>
            <button
              onClick={() => bridgeToYulia('What tier should I be on? Here’s what I’m working on: ')}
              className="cta-press shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[14px] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: accent,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 10px 30px -12px ${accent}aa`,
              }}
            >
              Let Yulia pick
              <span aria-hidden>→</span>
            </button>
          </div>

          {/* 5-tier grid — equal structure. The Pro tier
              gets accent border + "Most chosen" caption. Annual billing deferred to month 3\u20136. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIERS.map((t) => {
              const isHero = !!t.hero;
              const prev = t.inherits ? tierByKey(t.inherits) : null;
              const { main, sub } = displayPrice(t);
              return (
                <div
                  key={t.key}
                  className="pricing-tier-card rounded-2xl p-6 flex flex-col"
                  style={{
                    background: cardBg,
                    border: isHero ? `2px solid ${accent}` : `1px solid ${border}`,
                    color: headingColor,
                  }}
                >
                  {/* Eyebrow (subtle, low-tracking) — name takes the lead */}
                  <p
                    className="text-[11px] font-semibold mb-2"
                    style={{ color: isHero ? accent : mutedColor, letterSpacing: '0.02em' }}
                  >
                    {isHero ? 'Most chosen' : t.eyebrow}
                  </p>

                  {/* Name — primary type anchor */}
                  <h3
                    className="font-headline font-black tracking-[-0.02em] mb-2"
                    style={{ fontSize: '1.75rem', color: headingColor, lineHeight: 1 }}
                  >
                    {t.name}
                  </h3>

                  {/* Price — second type anchor, stacked under name (never shares a row) */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="font-headline font-black tabular-nums tracking-tight"
                        style={{ fontSize: '2.25rem', color: headingColor, lineHeight: 1 }}
                      >
                        {main}
                      </span>
                    </div>
                    <p className="text-[12px] mt-1" style={{ color: mutedColor }}>
                      {sub}
                    </p>
                  </div>

                  {/* Inheritance line — reduces repetition */}
                  {prev && (
                    <p
                      className="text-[12px] mb-2 pb-3 border-b"
                      style={{ color: bodyColor, borderColor: ruleColor }}
                    >
                      Everything in <strong style={{ color: headingColor }}>{prev.name}</strong>, plus:
                    </p>
                  )}

                  <ul className="space-y-2 flex-1">
                    {t.deltaFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check color={accent} />
                        <span className="text-[13px] leading-snug" style={{ color: bodyColor }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ Comparison table — the P0 fix: users can finally diff tiers ═══ */}
        <section className="mb-24">
          <details
            className="pricing-accordion rounded-2xl overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            <summary
              className="cursor-pointer px-6 py-4 flex items-center justify-between gap-4 select-none"
            >
              <span className="text-[14px] font-bold" style={{ color: headingColor }}>
                Compare every feature across all five tiers
              </span>
              <span className="text-[12px]" style={{ color: mutedColor }}>
                Expand ↓
              </span>
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full text-left tabular-nums">
                <thead>
                  <tr style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
                    <th className="p-3 text-[11px] font-bold uppercase" style={{ color: mutedColor, letterSpacing: '0.08em' }}>
                      Feature
                    </th>
                    {TIERS.map((t) => (
                      <th
                        key={t.key}
                        className="p-3 text-[11px] font-bold whitespace-nowrap"
                        style={{
                          color: t.hero ? accent : headingColor,
                          background: t.hero ? (dark ? 'rgba(232,112,154,0.08)' : 'rgba(212,74,120,0.06)') : 'transparent',
                        }}
                      >
                        {t.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.map((row, i) => (
                    <tr
                      key={row.feature}
                      style={{
                        borderBottom: i === MATRIX.length - 1 ? 'none' : `1px solid ${ruleColor}`,
                      }}
                    >
                      <td className="p-3 text-[13px]" style={{ color: bodyColor }}>
                        {row.feature}
                      </td>
                      {TIERS.map((t) => {
                        const v = row.values[t.key];
                        return (
                          <td
                            key={t.key}
                            className="p-3 text-[13px] text-center"
                            style={{
                              color: v === false ? mutedColor : bodyColor,
                              background: t.hero ? (dark ? 'rgba(232,112,154,0.04)' : 'rgba(212,74,120,0.03)') : 'transparent',
                            }}
                          >
                            {v === true ? (
                              <Check color={accent} size={15} />
                            ) : v === false ? (
                              <span style={{ color: mutedColor, opacity: 0.6 }}>—</span>
                            ) : (
                              <span>{v}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        {/* ═══ Service pros — demoted from hero to single-line policy strip ═══ */}
        <section className="mb-20">
          <div
            className="rounded-2xl p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
            }}
          >
            <div className="flex-1">
              <p
                className="text-[11px] font-semibold mb-1"
                style={{ color: accent, letterSpacing: '0.06em' }}
              >
                Policy · service professionals
              </p>
              <p className="text-[16px] md:text-[17px] leading-snug" style={{ color: headingColor }}>
                <strong>On someone else’s deal? Yulia is free for you.</strong>{' '}
                <span style={{ color: bodyColor }}>
                  Attorneys, CPAs, brokers, appraisers, wealth managers, RWI brokers, estate planners —
                  full access, white-label outputs, no seat fee. When a client brings you onto their workflow.
                </span>
              </p>
            </div>
            <button
              onClick={() =>
                bridgeToYulia("I'm a deal professional. I'd like to use Yulia for my client work.")
              }
              className="cta-press shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: 'transparent',
                color: accent,
                border: `1.5px solid ${accent}`,
                cursor: 'pointer',
              }}
            >
              Tell Yulia what you do →
            </button>
          </div>
        </section>

        {/* ═══ FAQ accordion — surfaces the FAQs that were SEO-only before ═══ */}
        <section className="mb-24">
          <SectionHeader
            label="Questions"
            title="Before you pick a tier."
            dark={dark}
          />
          <div className="space-y-2">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="pricing-accordion rounded-xl overflow-hidden group"
                style={{ background: cardBg, border: `1px solid ${border}` }}
              >
                <summary
                  className="cursor-pointer px-5 py-4 flex items-center justify-between gap-4 select-none"
                >
                  <span className="text-[15px] font-semibold" style={{ color: headingColor }}>
                    {f.q}
                  </span>
                  <span
                    className="text-[18px] font-bold transition-transform group-open:rotate-45 shrink-0"
                    style={{ color: accent, lineHeight: 1 }}
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-5 pb-5 pt-0 text-[14px] leading-relaxed"
                  style={{ color: bodyColor, borderTop: `1px solid ${ruleColor}` }}
                >
                  <p className="pt-4">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={<>Start free. Keep what you build.</>}
          sub="Run your first deliverable — Baseline, Rundown, or capital stack — without a credit card. If it saves you a week of work, pick a tier. If it doesn't, walk. Either way, what you built is yours to keep."
          buttonLabel="Start free"
          onClick={goToChat}
          dark={dark}
        />
      </div>
    </div>
  );
}
