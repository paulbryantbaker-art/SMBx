import { goToChat, bridgeToYulia } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { DealCostMap } from './DealCostMap';
import {
  HookHeader,
  SectionHeader,
  PageCTA,
} from './storyBlocks';

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
    faqs: [
      {
        question: 'How much does smbx.ai cost?',
        answer:
          'Six tiers: Free, $49/mo Single deal, $199/mo Multi-deal, $399/mo Team (5 seats), $1,999/mo Firm (unlimited seats), $6,999/mo Institutional. Every price published. Annual billing gets two months free on any paid tier.',
      },
      {
        question: 'Is there a free tier?',
        answer:
          'Yes. Unlimited Yulia conversation plus one full deliverable (Baseline, Rundown, or capital stack), yours to keep. Email required after the first deliverable. No card.',
      },
      {
        question: 'Which tier should I start with?',
        answer:
          'If you run more than one deal at a time, Multi-deal ($199/mo) is the default. Solo buyers on a first close start at Single deal ($49/mo). Small teams go Team. Advisory firms and small PE shops go Firm. $1B+ funds go Institutional. You can move up or down any time.',
      },
      {
        question: 'What do my attorney or CPA pay to join my deal?',
        answer:
          "Nothing. Service professionals run free on any deal workflow their client brings them onto. Full feature access. White-label outputs under their firm's brand.",
      },
      {
        question: 'Can I cancel?',
        answer:
          'Any time. No multi-year lock-in on any tier. Month-to-month or annual (2 months free) on Team, Firm, and Institutional.',
      },
      {
        question: 'Does Yulia take a success fee on my deal?',
        answer:
          'No. Flat-rate software subscription, period. Never a percentage of any transaction.',
      },
    ],
  });

  const handleCTA = (plan?: string) => {
    if (plan === 'firm') {
      bridgeToYulia("I'd like to set up the Firm plan ($1,999/mo) for our team. We have multiple deal pros and want unlimited seats.");
    } else if (plan === 'institutional') {
      bridgeToYulia("I'd like to set up the Institutional plan ($6,999/mo). We need SSO, API access, and a dedicated CSM.");
    } else {
      goToChat();
    }
  };

  // Colors
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? '#E8709A' : '#D44A78';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';

  /* ───────── Hero tier (Multi-deal — sweet spot per market research) ───────── */
  const heroFeatures = [
    'Unlimited Baseline, Rundown™, and capital stack models',
    'CIM generation from verified financials — 25-40 pages, not a template',
    'Blind Equity™ add-back schedule with source-line citations',
    '180-day post-close integration plans from your DD report',
    'Document state machine — draft → review → approved → executed',
    'Yulia routes documents to your attorney with focus areas',
    'Every action audited in the deal log (chain of custody)',
    'After-tax modeling on asset vs stock sale, earnouts, escrows',
    'All 10 interactive financial models',
    'Full deal room — your CPA, attorney, broker, lender all in one place',
  ];

  /* ───────── Six tiers — all published, no "talk to us" ─────────
     Market-benchmarked against AI-native knowledge-work products:
     Harvey ($100-200), Hebbia ($300-400), Rilla ($200), Spellbook ($150),
     EvenUp ($500-2k), Devin ($500/seat). Published like Cursor, not hidden
     like Intapp. */
  const tiers = [
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
        'Email required after first deliverable',
      ],
      cta: 'Start free',
      ctaPlan: undefined as string | undefined,
      tone: 'light' as const,
    },
    {
      key: 'single',
      name: 'Single deal',
      price: '$49',
      sub: '/mo',
      protagonist: 'Your first close',
      features: [
        'One active deal at a time',
        'SDE & EBITDA normalization, add-backs',
        'Deal scoring + SBA eligibility',
        'Sector comp multiples and benchmarks',
        'PDF exports with your name on them',
      ],
      cta: 'Start for $49',
      ctaPlan: undefined as string | undefined,
      tone: 'light' as const,
    },
    {
      key: 'team',
      name: 'Team',
      price: '$399',
      sub: '/mo · up to 5 seats',
      protagonist: 'Small deal teams & indie sponsors',
      features: [
        'Everything in Multi-deal × 5 seats',
        'Multi-deal portfolio view',
        'White-label outputs (your brand)',
        'Up to 10 active deals',
        'Priority email support',
      ],
      cta: 'Start Team',
      ctaPlan: undefined as string | undefined,
      tone: 'light' as const,
    },
    {
      key: 'firm',
      name: 'Firm',
      price: '$1,999',
      sub: '/mo · unlimited seats',
      protagonist: 'Advisory firms & small PE shops',
      features: [
        'Unlimited users + unlimited deals',
        'Single sign-on (SAML)',
        'Dedicated onboarding (2 weeks)',
        'SOC 2 report + contract terms',
        'Quarterly business review',
      ],
      cta: 'Start Firm',
      ctaPlan: 'firm' as string | undefined,
      tone: 'light' as const,
    },
    {
      key: 'institutional',
      name: 'Institutional',
      price: '$6,999',
      sub: '/mo · $1B+ funds & bulge bracket',
      protagonist: 'Full stack, SLA, API',
      features: [
        'Unlimited users + unlimited deals',
        'SSO / SAML + advanced RBAC',
        'Full API + webhooks',
        'Dedicated CSM + priority engineering',
        'White-glove onboarding + custom SLA',
      ],
      cta: 'Start Institutional',
      ctaPlan: 'institutional' as string | undefined,
      tone: 'dark' as const,
    },
  ];

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
              When Yulia is doing the work, pick the tier that fits. Six prices, all published.
              No sales call. No multi-year lock-in.
            </>
          }
          dark={dark}
        />

        {/* ═══ Connector — outcome-focused, not protagonist-heavy ═══ */}
        <p
          className="text-[14px] md:text-[15px] leading-relaxed mb-16 max-w-3xl"
          style={{ color: mutedColor }}
        >
          One subscription. Unlimited Baselines, deal scores, capital stacks, CIMs, 180-day plans.
          Attorneys, CPAs, appraisers, and wealth managers who join your deal run{' '}
          <strong style={{ color: accent }}>free</strong>. Cancel any time.
          Annual billing gets two months free.
        </p>

        {/* ═══ The Deal Cost Map ═══ */}
        <section className="mb-20">
          <SectionHeader
            label="The math · interactive"
            title="Three ways to pay for the same work."
            sub="Drag the deal size. The IB fee, the in-house analyst team cost, and the Yulia subscription all update live. The spread is the headline."
            dark={dark}
          />
          <DealCostMap dark={dark} />
        </section>

        {/* ═══ Tier cards — Multi-deal hero + 5 others ═══ */}
        <section className="mb-12">
          <SectionHeader
            label="Pick your tier"
            title="Six tiers. Every price published."
            sub="Most active operators land on Multi-deal. The other five are on-ramps and team upgrades. If it says $6,999, it costs $6,999 — no sales call required."
            dark={dark}
          />

          {/* Multi-deal — wide hero (market sweet spot: Harvey/Legora individual band) */}
          <div
            className="rounded-3xl p-8 md:p-12 mb-6 relative overflow-hidden"
            style={{
              background: dark ? '#1f1416' : '#fef0f4',
              border: `2px solid ${accent}`,
            }}
          >
            <div
              aria-hidden
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${accent}33, transparent 60%)`,
              }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
                  style={{ color: accent }}
                >
                  Most chosen · Market sweet spot
                </p>
                <h3
                  className="font-headline font-black tracking-[-0.02em] mb-3"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    color: headingColor,
                    lineHeight: 0.95,
                  }}
                >
                  Multi-deal
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="font-headline font-black tabular-nums tracking-tight"
                    style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: accent, lineHeight: 1 }}
                  >
                    $199
                  </span>
                  <span className="text-base font-medium" style={{ color: mutedColor }}>
                    / month
                  </span>
                </div>
                <p className="text-[12px] mb-4" style={{ color: mutedColor }}>
                  or <span style={{ color: headingColor, fontWeight: 600 }}>$1,990/year</span> — two months free
                </p>
                <p className="text-sm mb-6" style={{ color: mutedColor }}>
                  Unlimited deals · cancel anytime · no card required to start
                </p>

                <p className="text-[14px] leading-relaxed mb-6" style={{ color: bodyColor }}>
                  Anna J. runs Multi-deal. Mark D. upgraded into it after his free Baseline.
                  The default tier for engaged owners, individual buyers, and indie sponsors running
                  more than one deal at a time. Priced in the same band as Harvey and Legora — without
                  the law-firm overhead.
                </p>

                <button
                  onClick={() => handleCTA()}
                  className="cta-press group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white"
                  style={{
                    background: accent,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: `0 10px 30px -10px ${accent}aa`,
                  }}
                >
                  Start Multi-deal
                  <span aria-hidden className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5 group-active:translate-x-1">arrow_forward</span>
                </button>
              </div>

              <div className="lg:col-span-7">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
                  style={{ color: mutedColor }}
                >
                  What you get
                </p>
                <ul className="space-y-2.5">
                  {heroFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span
                        className="material-symbols-outlined text-base shrink-0 mt-1"
                        style={{ color: accent }}
                      >
                        check
                      </span>
                      <span className="text-[14px] leading-relaxed" style={{ color: bodyColor }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Other tiers — 5 cards in a responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {tiers.map((t) => {
              const isDark = t.tone === 'dark';
              return (
                <div
                  key={t.key}
                  className="rounded-2xl p-5 flex flex-col"
                  style={{
                    background: isDark ? '#0f1012' : innerBg,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : border}`,
                    color: isDark ? '#f9f9fc' : headingColor,
                  }}
                >
                  <div className="mb-2">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider block mb-1"
                      style={{ color: accent }}
                    >
                      {t.protagonist}
                    </span>
                    <h4 className="font-headline font-black text-base tracking-tight">
                      {t.name}
                    </h4>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className="font-headline font-black tabular-nums"
                      style={{ fontSize: '1.625rem', lineHeight: 1 }}
                    >
                      {t.price}
                    </span>
                  </div>
                  <p
                    className="text-[10px] mb-3"
                    style={{ color: isDark ? 'rgba(218,218,220,0.55)' : mutedColor }}
                  >
                    {t.sub}
                  </p>
                  <ul className="space-y-1.5 flex-1 mb-4">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[11px] leading-snug">
                        <span
                          className="material-symbols-outlined text-[12px] shrink-0 mt-0.5"
                          style={{ color: accent }}
                        >
                          check
                        </span>
                        <span style={{ color: isDark ? 'rgba(218,218,220,0.78)' : bodyColor }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCTA(t.ctaPlan)}
                    className="w-full py-2 rounded-full text-[11px] font-bold transition-all"
                    style={{
                      background: 'transparent',
                      color: isDark ? '#f9f9fc' : headingColor,
                      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.3)' : border}`,
                      cursor: 'pointer',
                    }}
                  >
                    {t.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Annual pricing microcopy — right under the tier grid */}
        <p className="text-center text-[13px] mt-6 mb-6" style={{ color: mutedColor }}>
          Annual billing on any paid tier: <span style={{ color: headingColor, fontWeight: 600 }}>2 months free</span>.
          Team, Firm, and Institutional: month-to-month or annual — no multi-year lock-in.
        </p>

        {/* ═══ Service pros free — policy callout, not a tier ═══ */}
        <section className="mb-20">
          <div
            className="rounded-2xl p-8 md:p-12 relative overflow-hidden"
            style={{
              background: dark ? '#0f1012' : '#0f1012',
              border: `1px solid rgba(255,255,255,0.08)`,
              color: '#f9f9fc',
            }}
          >
            <div
              aria-hidden
              className="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${accent}22, transparent 60%)`,
              }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.24em] mb-4"
                  style={{ color: accent }}
                >
                  Service professionals · free · forever
                </p>
                <h3
                  className="font-headline font-black tracking-[-0.02em] mb-5"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    lineHeight: 1,
                  }}
                >
                  Are you on someone else's deal?<br />
                  <em className="not-italic" style={{ color: accent }}>Yulia is free for you.</em>
                </h3>
                <p className="text-[16px] md:text-[17px] leading-relaxed mb-5" style={{ color: 'rgba(218,218,220,0.85)' }}>
                  Attorneys, CPAs, real-estate brokers, wealth managers, appraisers, rep &amp; warranty insurance brokers,
                  estate planners — free on any deal workflow your client brings you onto. Full feature access, white-label
                  outputs under your firm's brand, peer-to-peer tone from Yulia. No seat fee, ever.
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(218,218,220,0.55)' }}>
                  The line: service pros are free when invited to a client's deal. M&amp;A advisors, brokers, fundless
                  sponsors, search-fund principals, and PE deal teams who run their own deals on the platform use the
                  Team or Firm tier above — they are on their own book, not someone else's.
                </p>
              </div>

              <div className="lg:col-span-5">
                <div
                  className="rounded-xl p-6"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)` }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: accent }}>
                    Eligible roles
                  </p>
                  <ul className="space-y-2 text-[13px] mb-6" style={{ color: 'rgba(218,218,220,0.85)' }}>
                    {[
                      'M&A attorneys (corporate, transactional, tax)',
                      'CPAs and accounting firms',
                      'Commercial real estate brokers',
                      'Wealth managers serving deal clients',
                      'Appraisers and valuation firms',
                      'Rep & warranty insurance brokers',
                      'Estate planners',
                    ].map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <span
                          className="material-symbols-outlined text-[14px] shrink-0 mt-0.5"
                          style={{ color: accent }}
                        >
                          check
                        </span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() =>
                      bridgeToYulia(
                        "I'm a deal professional. I'd like to use Yulia for my client work."
                      )
                    }
                    className="cta-press w-full py-3 rounded-full text-sm font-bold text-white"
                    style={{
                      background: accent,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Tell Yulia what you do
                  </button>
                  <p className="text-[10px] text-center mt-3" style={{ color: 'rgba(218,218,220,0.4)' }}>
                    Tell Yulia you're a deal pro when you start. No application form.
                  </p>
                </div>
              </div>
            </div>
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
