import { goToChat, bridgeToYulia } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { DealCostMap } from './DealCostMap';
import { ChatGPTvsYulia } from './ChatGPTvsYulia';
import {
  HookHeader,
  SectionHeader,
  PageCTA,
  JourneyProvider,
} from './storyBlocks';

export default function PricingBelow({ dark }: { dark: boolean }) {
  usePageMeta({
    title: 'Investment bank power. For everyone. · smbx.ai pricing',
    description:
      'Yulia gives everyone investment bank power, knowledge, and guidance. 5-tier subscription from Free to Institutional. Verified deal professionals — attorneys, CPAs, brokers — free forever.',
    canonical: 'https://smbx.ai/pricing',
    ogImage: 'https://smbx.ai/og-pricing.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Pricing', url: 'https://smbx.ai/pricing' },
    ],
    faqs: [
      {
        question: 'Is Yulia a substitute for my M&A advisor or investment bank?',
        answer:
          "No. Yulia is the analytical engine and the workflow operating system. Your IB is the relationship engine, your fiduciary, and your seat at the closing table. Yulia routes your CIM to your attorney for review with focus areas. Your attorney signs off; the document state advances. The buyer's lawyer can ask where any number came from and the answer is in the audit log. Bring both — they do different jobs.",
      },
      {
        question: "I'm an attorney, CPA, or other deal professional. What do I pay?",
        answer:
          'Nothing. Verified deal professionals — attorneys, CPAs, real estate brokers, wealth managers, appraisers, insurance brokers, estate planners — get full Pro features for free, forever. Your clients pay their own subscription if they engage the platform directly. When you tell Yulia you are advising on a deal, she switches to peer-to-peer mode automatically.',
      },
      {
        question: "Why does the Pro tier cost so much less than what an IB would charge?",
        answer:
          'Yulia is software, not headcount. The math an IB analyst pod runs is the same math Yulia runs — comps, models, CIM drafts, capital stacks, after-tax modeling. The cost difference is the labor, the office, the recruiting pipeline, and the fee model. Yulia is a flat subscription. The IB is people. You can run both at once.',
      },
      {
        question: 'Can Yulia give me legal advice on my term sheet?',
        answer:
          "No. Yulia can read a term sheet and explain what each clause typically does in market deals, flag terms that look unusual versus comparable transactions, and model the after-tax impact of asset versus stock sales. What she cannot do is tell you whether to sign — that is your attorney's job. She does the homework. Your attorney does the calls.",
      },
      {
        question: 'Does Yulia take a success fee on my deal?',
        answer:
          'No. Yulia is a flat-rate software subscription, period. She does not earn a percentage of any transaction, does not effect any securities trades, and is not a registered broker-dealer. The line between software tools and broker-dealer is bright. We sit firmly on the software side.',
      },
      {
        question: 'Where does Yulia stop and a human take over?',
        answer:
          'The line is "thinking and drafting" versus "deciding and signing." Yulia thinks for you — analyzes, models, drafts, projects, routes documents through the sign-off chain. You decide and sign — usually with your attorney, CPA, or M&A advisor in the room. If a recommendation requires fiduciary judgment, a notarized signature, a courtroom appearance, or a regulated filing, that is where your human team takes over. Yulia gets you there ten times faster, but the last yard is theirs.',
      },
    ],
  });

  const handleCTA = (plan?: string) => {
    if (plan === 'firm') {
      bridgeToYulia("I'm interested in the Firm plan for our team.");
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

  /* ───────── Hero tier (Professional) ───────── */
  const proFeatures = [
    'CIM generated from your verified financials — 25-40 pages, not a template',
    'The Rundown™ — 7-dimension deal scoring in 8 seconds',
    'Stack Builder for live capital structure modeling',
    'Buyers, lenders, and advisors identified, ranked, and scored',
    'Document state machine — draft → review → approved → executed',
    'Yulia routes documents to your attorney with focus areas',
    'Every action audited in the deal log (chain of custody)',
    'Full deal room — your CPA, attorney, broker, lender all in one place',
    '180-day post-close integration plan from your DD report',
    'After-tax modeling on asset vs stock sale, earnouts, escrows',
  ];

  /* ───────── Other tiers ───────── */
  const otherTiers = [
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
      key: 'starter',
      name: 'Starter',
      price: '$49',
      sub: '/mo · single deal',
      protagonist: 'For your first close',
      features: [
        'Real SDE & EBITDA normalization',
        'Add-back schedule',
        'Deal scoring',
        'SBA eligibility & DSCR',
        'Sector market intelligence',
      ],
      cta: 'Start for $49',
      ctaPlan: undefined as string | undefined,
      tone: 'light' as const,
    },
    {
      key: 'practice',
      name: 'Practice',
      price: '$1,499',
      sub: '/mo · for the team',
      protagonist: 'Reese & Hammond runs this',
      features: [
        'Everything in Professional × 5 seats',
        'Multi-deal portfolio view',
        'White-label outputs (your brand)',
        'Up to 10 active deals',
        'Shared DD library',
      ],
      cta: 'Start 90-day trial',
      ctaPlan: undefined as string | undefined,
      tone: 'light' as const,
    },
    {
      key: 'firm',
      name: 'Firm',
      price: '$4,999',
      sub: '/mo · mid-market firms',
      protagonist: 'Sub-$1B PE & multi-MD shops',
      features: [
        'Unlimited users + unlimited deals',
        'API for pipeline integration',
        'Dedicated CSM + onboarding',
        'SOC 2 / SLA / contract terms',
        'Quarterly business reviews',
      ],
      cta: 'Talk to us',
      ctaPlan: 'firm' as string | undefined,
      tone: 'light' as const,
    },
    {
      key: 'institutional',
      name: 'Institutional',
      price: '$9,999',
      sub: '/mo · $1B+ funds & bulge bracket',
      protagonist: 'Self-serve, no sales call',
      features: [
        'Unlimited users + unlimited deals',
        'SSO / SAML',
        'Full API + webhooks',
        'Priority engineering support',
        'White-glove onboarding',
      ],
      cta: 'Start Institutional',
      ctaPlan: undefined as string | undefined,
      tone: 'dark' as const,
    },
  ];

  /* ───────── What Yulia does — by job ───────── */
  const jobs = [
    {
      n: '01',
      title: 'Sell',
      icon: 'sell',
      protagonist: 'Mark D., $18M EBITDA distributor',
      bullets: [
        'Real Baseline against your industry comp set',
        'Blind Equity™ add-back schedule',
        'CIM drafted from verified financials',
        'Buyer pool identified, ranked, scored',
        'Yulia routes draft to your CPA + attorney with focus areas',
      ],
    },
    {
      n: '02',
      title: 'Buy',
      icon: 'shopping_cart',
      protagonist: 'Priya S., growth equity VP',
      bullets: [
        'The Rundown™ — 7-dim scoring in 8 seconds',
        'IC memo drafted from a CIM excerpt',
        'Capital stack modeled against live lender rates',
        'DSCR, leverage, and covenant headroom',
        'Pursue / negotiate / kill verdict on every target',
      ],
    },
    {
      n: '03',
      title: 'Raise',
      icon: 'savings',
      protagonist: 'Ed K., independent sponsor',
      bullets: [
        'Senior, unitranche, mezz, equity, rollover — all modeled',
        'Blended cost of capital and year-1 DSCR',
        'Founder retention or sponsor MOIC at exit',
        'Term-sheet redlines against market norms',
        'LP pitch deck generated from the same numbers',
      ],
    },
    {
      n: '04',
      title: 'Integrate',
      icon: 'merge',
      protagonist: 'Anna J., search fund principal',
      bullets: [
        '180-day plan built from your DD report',
        'Customer health scoring on top accounts',
        'Continuous covenant headroom monitoring',
        'Pricing and contract optimization analysis',
        'Year-2 refi modeling and lender comparison',
      ],
    },
    {
      n: '05',
      title: 'Advise',
      icon: 'workspace_premium',
      protagonist: 'Reese & Hammond, 4-partner advisory',
      bullets: [
        'Baseline live in the first prospect meeting',
        'CIM drafts in 4 hours of partner review',
        'Buyer outreach lists ranked in a day',
        'Synergy thesis baked into every deck',
        'Multi-deal portfolio view across all mandates',
      ],
    },
  ];

  return (
    <JourneyProvider value="brand"><div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="pricing"
          headline={
            <>
              Yulia gives everyone <br />
              investment bank <em className="not-italic" style={{ color: accent }}>power.</em>
            </>
          }
          sub={
            <>
              Knowledge, models, drafting, guidance — and the workflow that closes the deal. <strong style={{ color: headingColor }}>Everyone starts free.</strong>{' '}
              You only pay when you've decided Yulia is doing the work of an analyst pod for the price of a Slack subscription.
            </>
          }
          dark={dark}
        />

        {/* ═══ Connector — protagonists ═══ */}
        <p
          className="text-[13px] md:text-[14px] leading-relaxed mb-16 max-w-3xl"
          style={{ color: mutedColor }}
        >
          <span className="font-bold" style={{ color: accent }}>Mark D.</span> ran Free until he was ready, then upgraded.{' '}
          <span className="font-bold" style={{ color: accent }}>Anna J.</span> runs Professional.{' '}
          <span className="font-bold" style={{ color: accent }}>Reese & Hammond</span> runs Practice for the partners.{' '}
          <span className="font-bold" style={{ color: accent }}>Ed K.'s</span> deal team runs Firm. The bulge bracket ones run Institutional.
          And every attorney, CPA, broker, and wealth manager on the platform runs free, forever.
        </p>

        {/* ═══ ChatGPT vs Yulia — the actual differentiator ═══ */}
        <section className="mb-20">
          <ChatGPTvsYulia dark={dark} />
        </section>

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

        {/* ═══ Tier cards — Pro hero + 5 smaller ═══ */}
        <section className="mb-12">
          <SectionHeader
            label="Pick your tier"
            title="One hero plan. Five on-ramps."
            sub="Most owners, individual buyers, and indie sponsors land on Professional. The other tiers are entry doors and team upgrades."
            dark={dark}
          />

          {/* Professional — wide hero */}
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
                  Most chosen tier
                </p>
                <h3
                  className="font-headline font-black tracking-[-0.02em] mb-3"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    color: headingColor,
                    lineHeight: 0.95,
                  }}
                >
                  Professional
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
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
                <p className="text-sm mb-6" style={{ color: mutedColor }}>
                  Full deal execution · 90-day free trial · cancel anytime
                </p>

                <p className="text-[14px] leading-relaxed mb-6" style={{ color: bodyColor }}>
                  Anna J. runs Professional. Mark D. upgraded into it after his free Baseline.
                  The default tier for most engaged owners, individual buyers, and indie sponsors running 1-5 deals.
                </p>

                <button
                  onClick={() => handleCTA()}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all"
                  style={{
                    background: accent,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: `0 10px 30px -10px ${accent}aa`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  Start 90-day trial
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
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
                  {proFeatures.map((f) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {otherTiers.map((t) => {
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

        {/* ═══ Pro · Free callout ═══ */}
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
                  Pro · Free · forever
                </p>
                <h3
                  className="font-headline font-black tracking-[-0.02em] mb-5"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    lineHeight: 1,
                  }}
                >
                  Are you a deal professional?<br />
                  <em className="not-italic" style={{ color: accent }}>Yulia is free for you.</em>
                </h3>
                <p className="text-[16px] md:text-[17px] leading-relaxed mb-5" style={{ color: 'rgba(218,218,220,0.85)' }}>
                  Attorneys, CPAs, real estate brokers, wealth managers, appraisers, rep & warranty insurance brokers,
                  estate planners — full Professional features, free forever. White-label outputs that carry your firm's brand.
                  Multi-client deal view. Yulia switches to peer-to-peer mode the moment you tell her you're advising.
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(218,218,220,0.55)' }}>
                  The catch: when your client engages the platform directly to manage their own deal, they get a 14-day trial
                  and then need their own subscription. We make it free for you. We don't make it free for them through you.
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
                    className="w-full py-3 rounded-full text-sm font-bold text-white transition-all"
                    style={{
                      background: accent,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Tell Yulia what you do
                  </button>
                  <p className="text-[10px] text-center mt-3" style={{ color: 'rgba(218,218,220,0.4)' }}>
                    Yulia will recognize you in conversation. No application form.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ What Yulia does — by job ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="What Yulia does"
            title="Five jobs. One subscription."
            sub="Same vocabulary as the journey pages. Whatever job you came here to do, Yulia handles the analytical layer end-to-end."
            dark={dark}
          />

          <div className="space-y-10">
            {jobs.map((job) => (
              <div
                key={job.n}
                className="grid grid-cols-12 gap-6 md:gap-10 pt-8"
                style={{ borderTop: `1px solid ${border}` }}
              >
                <div className="col-span-12 md:col-span-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span
                      className="font-headline font-black tabular-nums"
                      style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: accent, lineHeight: 0.95 }}
                    >
                      {job.n}
                    </span>
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ color: accent }}
                    >
                      {job.icon}
                    </span>
                  </div>
                  <h3
                    className="font-headline font-black tracking-tight mb-2"
                    style={{
                      fontSize: 'clamp(1.75rem, 2.6vw, 2.25rem)',
                      color: headingColor,
                      lineHeight: 1.05,
                    }}
                  >
                    {job.title}
                  </h3>
                  <p className="text-[12px] font-mono" style={{ color: mutedColor }}>
                    {job.protagonist}
                  </p>
                </div>

                <div className="col-span-12 md:col-span-8">
                  <ul className="space-y-3">
                    {job.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <span
                          className="material-symbols-outlined text-base shrink-0 mt-1"
                          style={{ color: accent }}
                        >
                          arrow_forward
                        </span>
                        <span className="text-[16px] leading-relaxed" style={{ color: bodyColor }}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ The Line — legal FAQ ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="The line"
            title="What Yulia can't do — and why that matters."
            sub="Yulia educates, models, drafts, routes, and orchestrates. She doesn't sign, certify, or close. The line between software and broker-dealer is bright. Here's where it sits."
            dark={dark}
          />

          <div className="space-y-8">
            {[
              {
                q: 'Is Yulia a substitute for my M&A advisor or investment bank?',
                a: (
                  <>
                    No. Yulia is the analytical engine and the workflow operating system. Your IB is the relationship engine,
                    your fiduciary, and your seat at the closing table. Yulia routes your CIM to your attorney with focus areas;
                    your attorney signs off; the document state advances; the buyer's lawyer can ask where any number came from
                    and the answer is in the audit log. <strong>Bring both.</strong>
                  </>
                ),
              },
              {
                q: "I'm an attorney, CPA, or other deal professional. What do I pay?",
                a: (
                  <>
                    <strong>Nothing.</strong> Verified deal professionals — attorneys, CPAs, real estate brokers, wealth managers,
                    appraisers, insurance brokers, estate planners — get full Professional features for free, forever. Your clients
                    pay their own subscription if they engage the platform directly. Yulia recognizes you in conversation and switches
                    to peer-to-peer mode automatically.
                  </>
                ),
              },
              {
                q: 'Can Yulia give me legal advice on my term sheet?',
                a: (
                  <>
                    No. Yulia can read a term sheet and explain what each clause typically does in market deals. She can flag terms
                    that look unusual versus comparable transactions. She can model the after-tax impact of an asset sale versus a
                    stock sale. What she <em>cannot</em> do is tell you whether to sign — that's your attorney's job.{' '}
                    <strong>She does the homework. Your attorney does the calls.</strong>
                  </>
                ),
              },
              {
                q: 'Can Yulia certify my financials or give me a Quality of Earnings opinion?',
                a: (
                  <>
                    No. Yulia normalizes EBITDA, finds the legitimate add-backs your tax-optimized statements hide, and surfaces
                    what a buyer would actually underwrite. She does <em>not</em> certify, audit, or attest. When you take Yulia's
                    add-back schedule to a buyer, your CPA or QoE firm has to stand behind the numbers in writing.{' '}
                    <strong>Yulia builds the schedule. Your accountant signs it.</strong>
                  </>
                ),
              },
              {
                q: 'Does Yulia take a success fee on my deal?',
                a: (
                  <>
                    No. Yulia is a flat-rate software subscription, period. She does <em>not</em> earn a percentage of any
                    transaction, does not effect any securities trades, and is not a registered broker-dealer with FINRA.
                    The line between "software tools" and "broker-dealer" is bright. <strong>We sit firmly on the software side.</strong>
                  </>
                ),
              },
              {
                q: 'Where does Yulia stop and a human take over?',
                a: (
                  <>
                    The line is "thinking and drafting" versus "deciding and signing." Yulia thinks for you — analyzes, models,
                    drafts, projects, routes documents through the sign-off chain. You decide and sign — usually with your attorney,
                    CPA, or M&A advisor in the room. If a recommendation requires fiduciary judgment, a notarized signature, a
                    courtroom appearance, or a regulated filing, that's where your human team takes over.{' '}
                    <strong>Yulia gets you there ten times faster, but the last yard is theirs.</strong>
                  </>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-6 md:gap-10 pt-8"
                style={{ borderTop: `1px solid ${border}` }}
              >
                <div className="col-span-12 md:col-span-4">
                  <h3
                    className="font-headline font-black tracking-tight"
                    style={{
                      fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)',
                      color: headingColor,
                      lineHeight: 1.15,
                    }}
                  >
                    {item.q}
                  </h3>
                </div>
                <div className="col-span-12 md:col-span-8">
                  <p className="text-[16px] md:text-[17px] leading-[1.65]" style={{ color: bodyColor }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={<>Run Yulia free. Pay only if she's worth it.</>}
          sub="Run your first deliverable free — Baseline, Rundown, or capital stack model. If Yulia doesn't surface something your team missed, keep it and walk. No card on file."
          buttonLabel="Start free"
          onClick={goToChat}
          dark={dark}
        />
      </div>
    </div></JourneyProvider>
  );
}
