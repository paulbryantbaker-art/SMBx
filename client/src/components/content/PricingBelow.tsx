import { useState } from 'react';
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

type TierKey = 'free' | 'single' | 'multi' | 'team' | 'firm' | 'institutional';

type Tier = {
  key: TierKey;
  name: string;
  monthly: number;
  annual: number;      // total annual price (monthly * 10 for 2-months-free)
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
    annual: 0,
    priceSuffix: 'forever',
    eyebrow: 'Start here',
    deltaFeatures: [
      'Unlimited Yulia conversation',
      'One full deliverable, yours to keep',
      'Real Baseline range, 7-factor readiness',
      'Email required after first deliverable',
    ],
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
      'One active deal at a time',
      'SDE & EBITDA normalization with add-backs',
      'Deal scoring + SBA eligibility',
      'Sector comp multiples + benchmarks',
      'PDF exports with your name on them',
    ],
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
      'CIM generation from verified financials',
      'Blind Equity™ add-back schedule',
      '180-day post-close integration plans',
      'Document state machine (draft → approved → executed)',
      'All 10 interactive financial models',
      'Full deal room — CPA, attorney, broker, lender',
    ],
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
      'Multi-deal portfolio view',
      'White-label outputs (your brand)',
      'Up to 10 active deals concurrently',
      'Priority email support',
    ],
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
      'Unlimited seats + unlimited deals',
      'Single sign-on (SAML)',
      'Dedicated onboarding (2 weeks)',
      'SOC 2 report + contract terms',
      'Quarterly business review',
    ],
  },
  {
    key: 'institutional',
    name: 'Institutional',
    monthly: 6999,
    annual: 69990,
    priceSuffix: '/mo',
    eyebrow: '$1B+ funds · bulge bracket',
    inherits: 'firm',
    deltaFeatures: [
      'Advanced RBAC',
      'Full API + webhooks',
      'Dedicated CSM + priority engineering',
      'Custom SLA',
      'White-glove onboarding',
    ],
  },
];

/* Feature matrix for the comparison table (P0 fix — lets users diff tiers). */
type MatrixRow = { feature: string; values: Record<TierKey, string | boolean> };
const MATRIX: MatrixRow[] = [
  { feature: 'Unlimited Yulia conversation', values: { free: true, single: true, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'Deliverables',                 values: { free: '1', single: 'Unlimited', multi: 'Unlimited', team: 'Unlimited', firm: 'Unlimited', institutional: 'Unlimited' } },
  { feature: 'Active deals',                 values: { free: '—', single: '1', multi: 'Unlimited', team: '10', firm: 'Unlimited', institutional: 'Unlimited' } },
  { feature: 'Baseline + 7-factor readiness',values: { free: true, single: true, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'SDE / EBITDA normalization',   values: { free: false, single: true, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'Deal scoring + SBA',           values: { free: false, single: true, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'Sector comp multiples',        values: { free: false, single: true, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'CIM generation',               values: { free: false, single: false, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'Blind Equity™ add-backs',      values: { free: false, single: false, multi: true, team: true, firm: true, institutional: true } },
  { feature: '180-day integration plan',     values: { free: false, single: false, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'All 10 financial models',      values: { free: false, single: false, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'Full deal room',               values: { free: false, single: false, multi: true, team: true, firm: true, institutional: true } },
  { feature: 'Seats',                        values: { free: '1', single: '1', multi: '1', team: '5', firm: 'Unlimited', institutional: 'Unlimited' } },
  { feature: 'White-label outputs',          values: { free: false, single: false, multi: false, team: true, firm: true, institutional: true } },
  { feature: 'Priority support',             values: { free: false, single: false, multi: false, team: 'Email', firm: 'CSM', institutional: 'Dedicated CSM' } },
  { feature: 'SSO / SAML',                   values: { free: false, single: false, multi: false, team: false, firm: true, institutional: true } },
  { feature: 'SOC 2 report',                 values: { free: false, single: false, multi: false, team: false, firm: true, institutional: true } },
  { feature: 'Advanced RBAC',                values: { free: false, single: false, multi: false, team: false, firm: false, institutional: true } },
  { feature: 'API + webhooks',               values: { free: false, single: false, multi: false, team: false, firm: false, institutional: true } },
  { feature: 'Custom SLA',                   values: { free: false, single: false, multi: false, team: false, firm: false, institutional: true } },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How much does smbx.ai cost?',
    a: 'Six tiers: Free, $49/mo Single deal, $199/mo Multi-deal, $399/mo Team (5 seats), $1,999/mo Firm (unlimited seats), $6,999/mo Institutional. Every price is published. Annual billing gets two months free on any paid tier.',
  },
  {
    q: 'Is there really a free tier?',
    a: 'Yes. Unlimited Yulia conversation plus one full deliverable (Baseline, Rundown, or capital stack), yours to keep. Email required after the first deliverable. No card.',
  },
  {
    q: 'Which tier should I start with?',
    a: 'If you run more than one deal at a time, Multi-deal ($199/mo) is the default. Solo buyers on a first close start at Single deal ($49/mo). Small teams go Team. Advisory firms and small PE shops go Firm. $1B+ funds go Institutional. You can move up or down any time.',
  },
  {
    q: 'What do my attorney or CPA pay to join my deal?',
    a: "Nothing. Service professionals run free on any deal workflow their client brings them onto. Full feature access. White-label outputs under their firm's brand.",
  },
  {
    q: 'Can I cancel?',
    a: 'Any time. No multi-year lock-in on any tier. Month-to-month or annual (2 months free) on Team, Firm, and Institutional.',
  },
  {
    q: 'Does Yulia take a success fee on my deal?',
    a: 'No. Flat-rate software subscription, period. Never a percentage of any transaction.',
  },
  {
    q: 'Why these prices? What are you benchmarking against?',
    a: 'AI-native knowledge-work products — Harvey ($100-200/seat), Hebbia ($300-400/seat), Rilla ($200/rep), Spellbook ($150/seat). We’re in that band for individuals and teams, deliberately under the legacy M&A stack (DealCloud, Intapp — $30k+/yr minimums).',
  },
];

export default function PricingBelow({ dark }: { dark: boolean }) {
  usePageMeta({
    title: 'Close faster. Pay less doing it. · smbx.ai pricing',
    description:
      'Six published prices from free to $6,999. Everyone starts free. Cancel anytime. Annual billing gets two months free. Service pros run free on any deal their client brings them onto.',
    canonical: 'https://smbx.ai/pricing',
    ogImage: 'https://smbx.ai/og-pricing.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Pricing', url: 'https://smbx.ai/pricing' },
    ],
    faqs: FAQS.map((f) => ({ question: f.q, answer: f.a })),
  });

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

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
    if (billing === 'annual') {
      return {
        main: `$${Math.round(t.annual / 12).toLocaleString()}`,
        sub: `${t.priceSuffix} · billed $${t.annual.toLocaleString()}/yr`,
      };
    }
    return {
      main: `$${t.monthly.toLocaleString()}`,
      sub: t.priceSuffix,
    };
  };

  return (
    <div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="pricing"
          headline={
            <>
              Close faster.<br />
              Pay <em className="not-italic" style={{ color: accent }}>less</em> doing it.
            </>
          }
          sub={
            <>
              <strong style={{ color: headingColor }}>Everyone starts free.</strong>{' '}
              Yulia picks the right tier during chat — no forms, no sales call.
              Every price published anyway. Service pros on someone else’s deal run free.
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

        {/* ═══ Tier cards with Annual/Monthly toggle ═══ */}
        <section className="mb-10">
          <SectionHeader
            label="The six tiers"
            title="Yulia picks the right one for you."
            sub="Tell her what you’re working on — she reads your situation and routes you to the tier that fits. Every price published anyway, so you can sanity-check her pick."
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

          {/* Annual/Monthly toggle */}
          <div className="flex justify-center mb-8">
            <div
              role="tablist"
              aria-label="Billing period"
              className="inline-flex p-1 rounded-full"
              style={{ background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)', border: `1px solid ${border}` }}
            >
              {(['monthly', 'annual'] as const).map((opt) => {
                const active = billing === opt;
                return (
                  <button
                    key={opt}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setBilling(opt)}
                    className="px-5 py-2 rounded-full text-[13px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{
                      background: active ? (dark ? '#f9f9fc' : '#0f1012') : 'transparent',
                      color: active ? (dark ? '#0f1012' : '#f9f9fc') : mutedColor,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt === 'monthly' ? 'Monthly' : 'Annual'}
                    {opt === 'annual' && (
                      <span
                        className="ml-2 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: active ? accent : accent, opacity: active ? 1 : 0.85 }}
                      >
                        2 mo free
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6-tier grid — equal structure, no "hero" card. The Multi-deal tier
              gets accent border + "Most chosen" caption. No glow ellipses. */}
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
                Compare every feature across all six tiers
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
