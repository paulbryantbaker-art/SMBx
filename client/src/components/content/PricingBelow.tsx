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
    title: 'Investment bank power. For everyone. · smbx.ai pricing',
    description:
      'Yulia gives owners, buyers, and advisors the analytical horsepower an IB analyst pod gives a fee-paying client — for $149 a month. The relationships and signatures still belong to your team.',
    canonical: 'https://smbx.ai/pricing',
    faqs: [
      {
        question: 'Is Yulia a substitute for my M&A advisor or investment bank?',
        answer:
          "No. Yulia is the analytical engine. Your IB is the relationship engine, your fiduciary, and your seat at the closing table. What Yulia does that scales: research, modeling, document drafting, comp analysis, scenario testing — the boring stuff that takes an analyst pod 200 hours. What your IB does that doesn't scale: walking the deal into a room of strategic buyers, signing the engagement letter as your fiduciary, defending the price when the buyer's lawyer pushes back. Bring both.",
      },
      {
        question: 'Can Yulia give me legal advice on my term sheet?',
        answer:
          "No. Yulia can read a term sheet and explain what each clause typically does in market deals. She can flag terms that look unusual versus comparable transactions. She can model the after-tax impact of an asset sale versus a stock sale. What she cannot do is tell you whether to sign — that's your attorney's job. She does the homework. Your attorney does the calls.",
      },
      {
        question: 'Can Yulia certify my financials or give me a Quality of Earnings opinion?',
        answer:
          'No. Yulia normalizes EBITDA, finds the legitimate add-backs your tax-optimized statements hide, and surfaces what a buyer would actually underwrite. She does not certify, audit, or attest. When you take Yulia\'s add-back schedule to a buyer, your CPA or QoE firm has to stand behind the numbers in writing. Yulia builds the schedule. Your accountant signs it.',
      },
      {
        question: 'Does Yulia take a success fee on my deal?',
        answer:
          'No. Yulia is a flat-rate software subscription — $0, $49, $149, or $999 a month, period. She does not earn a percentage of any transaction, does not effect any securities trades, and is not a registered broker-dealer with FINRA. The line between "software tools" and "broker-dealer" is bright. We sit firmly on the software side.',
      },
      {
        question: 'What does "investment bank power" actually mean if Yulia isn\'t an IB?',
        answer:
          "It means you get the same analytical horsepower an IB's analyst pod gives a fee-paying client — comps, models, CIM drafts, buyer scoring, cap stack work, after-tax modeling — at a flat software price. The bank still owns the relationships, the fiduciary duty, the regulated work, and the closing-table seat. Yulia does the work that scales. They do the work that doesn't.",
      },
      {
        question: 'Where does Yulia stop and a human take over?',
        answer:
          'The line is "thinking and drafting" versus "deciding and signing." Yulia thinks for you — analyzes, models, drafts, projects. You decide and sign — usually with your attorney, CPA, or M&A advisor in the room. If a recommendation requires fiduciary judgment, a notarized signature, a courtroom appearance, or a regulated filing, that\'s where your human team takes over. Yulia gets you there ten times faster, but the last yard is theirs.',
      },
    ],
  });

  const handleCTA = (plan?: string) => {
    if (plan === 'enterprise') {
      bridgeToYulia("I'm interested in the Enterprise plan for my team.");
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

  /* ───────── Tier definitions ───────── */
  const proFeatures = [
    'CIM generated from your verified financials — 25-40 pages, not a template',
    'Buyers identified, ranked, and scored by fit — not just listed',
    'Every counter-offer drafted with comparable deal data',
    'Due diligence coordinated — 50-100 items tracked to completion',
    'LOI terms modeled for after-tax impact before you send',
    '180-day post-close integration plan from actual DD findings',
    'Capital stack modeling against live 2024-2025 lender rates',
    'The Rundown™ — 7-dimension deal scoring in 8 seconds',
  ];

  const tinyTiers = [
    {
      name: 'Free',
      price: '$0',
      sub: 'Forever · email only',
      protagonist: 'Mark D. started here.',
      features: [
        'Talk to Yulia, unlimited',
        'Preliminary Baseline range',
        '7-factor readiness score',
        'One full deliverable, yours to keep',
      ],
      cta: 'Start free',
      ctaPlan: undefined as string | undefined,
    },
    {
      name: 'Starter',
      price: '$49',
      sub: '/mo · one specific deal',
      protagonist: 'For your first close.',
      features: [
        'Real SDE & EBITDA normalization',
        'Add-back schedule',
        'Deal scoring',
        'SBA eligibility & DSCR',
        'Sector market intelligence',
      ],
      cta: 'Start for $49',
      ctaPlan: undefined as string | undefined,
    },
    {
      name: 'Enterprise',
      price: '$999',
      sub: '/mo · for the team',
      protagonist: 'Ed K. runs this.',
      features: [
        'Everything in Professional × team',
        'White-label output — your brand',
        'API access for pipeline integration',
        'Dedicated onboarding & priority support',
      ],
      cta: 'Talk to us',
      ctaPlan: 'enterprise' as string | undefined,
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
        'CIM drafted from your verified financials',
        'Buyer pool identified, ranked, and scored',
        'Counter-offer math with comparable deal data',
      ],
    },
    {
      n: '02',
      title: 'Buy',
      icon: 'shopping_cart',
      protagonist: 'Priya S., growth equity VP',
      bullets: [
        'The Rundown™ — 7-dimension scoring in 8 seconds',
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
    <div className="bg-transparent" style={{ color: headingColor }}>
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
              Knowledge, models, drafting, guidance — at <strong style={{ color: headingColor }}>$149 a month</strong>. The
              relationships, the fiduciary duty, and the signatures still belong to your team. Yulia does the work that scales.
            </>
          }
          dark={dark}
        />

        {/* ═══ Connector — protagonists ═══ */}
        <p
          className="text-[13px] md:text-[14px] leading-relaxed mb-16 max-w-2xl"
          style={{ color: mutedColor }}
        >
          <span className="font-bold" style={{ color: accent }}>Mark D.</span> ran Free until he was ready, then upgraded.{' '}
          <span className="font-bold" style={{ color: accent }}>Anna J.</span> runs Professional.{' '}
          <span className="font-bold" style={{ color: accent }}>Reese & Hammond</span> runs Professional for the partners.{' '}
          <span className="font-bold" style={{ color: accent }}>Ed K.</span> runs Enterprise for his deal team.
          Pick the tier that fits your job — change later, no penalty.
        </p>

        {/* ═══ The Deal Cost Map — hero math ═══ */}
        <section className="mb-20">
          <SectionHeader
            label="The math · interactive"
            title="Three ways to pay for the same work."
            sub="Drag the deal size. The IB fee, the in-house analyst team cost, and the Yulia subscription all update live. The spread is the headline."
            dark={dark}
          />
          <DealCostMap dark={dark} />
        </section>

        {/* ═══ Tier cards — Pro hero + 3 small ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Pick your tier"
            title="One hero plan. Three on-ramps."
            sub="Most owners, buyers, and advisors land on Professional. The other tiers are entry doors and team upgrades."
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
            {/* Glow */}
            <div
              aria-hidden
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${accent}33, transparent 60%)`,
              }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: name + price */}
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
                    $149
                  </span>
                  <span className="text-base font-medium" style={{ color: mutedColor }}>
                    / month
                  </span>
                </div>
                <p className="text-sm mb-6" style={{ color: mutedColor }}>
                  Full deal execution · 90-day free trial for new accounts
                </p>

                <p className="text-[14px] leading-relaxed mb-6" style={{ color: bodyColor }}>
                  Anna J. runs Professional. Mark D. upgraded into it after his free Baseline.
                  Reese & Hammond's partners share a single Pro account across 22 active mandates.
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

              {/* Right: feature list */}
              <div className="lg:col-span-7">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
                  style={{ color: mutedColor }}
                >
                  What you get
                </p>
                <ul className="space-y-3">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span
                        className="material-symbols-outlined text-base shrink-0 mt-1"
                        style={{ color: accent }}
                      >
                        check
                      </span>
                      <span className="text-[15px] leading-relaxed" style={{ color: bodyColor }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Free / Starter / Enterprise — 3 smaller cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tinyTiers.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 flex flex-col"
                style={{
                  background: t.name === 'Enterprise' ? '#0f1012' : innerBg,
                  border: `1px solid ${t.name === 'Enterprise' ? 'rgba(255,255,255,0.08)' : border}`,
                  color: t.name === 'Enterprise' ? '#f9f9fc' : headingColor,
                }}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <h4 className="font-headline font-black text-lg tracking-tight">
                    {t.name}
                  </h4>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    {t.protagonist}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-headline font-black tabular-nums" style={{ fontSize: '2rem', lineHeight: 1 }}>
                    {t.price}
                  </span>
                  <span className="text-xs" style={{ color: t.name === 'Enterprise' ? 'rgba(218,218,220,0.55)' : mutedColor }}>
                    {t.sub}
                  </span>
                </div>
                <ul className="mt-4 space-y-1.5 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px] leading-relaxed">
                      <span
                        className="material-symbols-outlined text-[14px] shrink-0 mt-0.5"
                        style={{ color: accent }}
                      >
                        check
                      </span>
                      <span style={{ color: t.name === 'Enterprise' ? 'rgba(218,218,220,0.78)' : bodyColor }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCTA(t.ctaPlan)}
                  className="mt-5 w-full py-2.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: 'transparent',
                    color: t.name === 'Enterprise' ? '#f9f9fc' : headingColor,
                    border: `1.5px solid ${t.name === 'Enterprise' ? 'rgba(255,255,255,0.3)' : border}`,
                    cursor: 'pointer',
                  }}
                >
                  {t.cta}
                </button>
              </div>
            ))}
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
                {/* Number / title / protagonist */}
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

                {/* Bullets */}
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

        {/* ═══ The IB Line — legal FAQ ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="The line"
            title="What Yulia can't do — and why that matters."
            sub="Yulia educates, models, drafts, and guides. She doesn't sign, certify, or close. The line between software and broker-dealer is bright. Here's where it sits."
            dark={dark}
          />

          <div className="space-y-8">
            {[
              {
                q: 'Is Yulia a substitute for my M&A advisor or investment bank?',
                a: (
                  <>
                    No. Yulia is the analytical engine. Your IB is the relationship engine, your fiduciary, and your seat at the
                    closing table. What Yulia does that scales: research, modeling, document drafting, comp analysis, scenario
                    testing — the boring stuff that takes an analyst pod 200 hours. What your IB does that{' '}
                    <em>doesn't</em> scale: walking the deal into a room of strategic buyers, signing the engagement letter as
                    your fiduciary, defending the price when the buyer's lawyer pushes back. <strong>Bring both.</strong>
                  </>
                ),
              },
              {
                q: 'Can Yulia give me legal advice on my term sheet?',
                a: (
                  <>
                    No. Yulia can read a term sheet and explain what each clause typically does in market deals. She can flag
                    terms that look unusual versus comparable transactions. She can model the after-tax impact of an asset sale
                    versus a stock sale. What she <em>cannot</em> do is tell you whether to sign — that's your attorney's job.{' '}
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
                    No. Yulia is a flat-rate software subscription — $0, $49, $149, or $999 a month, period. She does <em>not</em>{' '}
                    earn a percentage of any transaction, does not effect any securities trades, and is not a registered
                    broker-dealer with FINRA. The line between "software tools" and "broker-dealer" is bright.{' '}
                    <strong>We sit firmly on the software side.</strong>
                  </>
                ),
              },
              {
                q: 'What does "investment bank power" actually mean if Yulia isn\'t an IB?',
                a: (
                  <>
                    It means you get the same analytical horsepower an IB's analyst pod gives a fee-paying client — comps,
                    models, CIM drafts, buyer scoring, cap stack work, after-tax modeling — at a flat software price. The bank
                    still owns the relationships, the fiduciary duty, the regulated work, and the closing-table seat.{' '}
                    <strong>Yulia does the work that scales. They do the work that doesn't.</strong>
                  </>
                ),
              },
              {
                q: 'Where does Yulia stop and a human take over?',
                a: (
                  <>
                    The line is "thinking and drafting" versus "deciding and signing." Yulia thinks for you — analyzes, models,
                    drafts, projects. You decide and sign — usually with your attorney, CPA, or M&A advisor in the room. If a
                    recommendation requires fiduciary judgment, a notarized signature, a courtroom appearance, or a regulated
                    filing, that's where your human team takes over.{' '}
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
    </div>
  );
}
