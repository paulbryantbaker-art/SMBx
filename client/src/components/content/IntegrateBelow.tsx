import { goToChat } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { Day180Calendar } from './Day180Calendar';
import {
  HookHeader,
  StoryBlock,
  SlowVsFast,
  SectionHeader,
  SignOffChain,
  PageCTA,
} from './storyBlocks';

export default function IntegrateBelow({ dark }: { dark: boolean }) {
  usePageMeta({
    title: 'The deal closed. Now make it pay. · Integrate with smbx.ai',
    description:
      'Hit your model in year 1. Refi at a higher multiple in year 2. The 180-day post-close playbook from Anna J — search fund principal, $90M acquisition, 2.7× MOIC in 18 months.',
    canonical: 'https://smbx.ai/integrate',
    ogImage: 'https://smbx.ai/og-integrate.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Post-acquisition integration', url: 'https://smbx.ai/integrate' },
    ],
    faqs: [
      {
        question: 'What happens in the first 180 days after closing an acquisition?',
        answer:
          "Day 0-14 is stabilization: meet every employee, contact top customers, shadow every role, change nothing operationally. Day 15-30 is quick wins: pricing reviews, financial reporting setup, knowledge documentation. Day 30-90 is strengthening: critical hires, system upgrades, seller transition. Day 90-180 is acceleration: growth initiatives, KPI dashboards, refi prep. The plan is the difference between hitting the deal model and tripping a covenant.",
      },
      {
        question: "What's the biggest risk in year 1 of an acquisition?",
        answer:
          'Senior debt covenant trips. Most upper middle market acquisitions close at 1.30-1.50× DSCR with a 1.20× minimum covenant. A 14-20% EBITDA dip in year 1 — common during transition — drops you below the covenant and triggers default. The fix is continuous monitoring: customer health, employee retention, EBITDA build-back, covenant headroom. Yulia tracks all four daily.',
      },
      {
        question: 'When can I refinance after an acquisition?',
        answer:
          'Year 2 is typical. By month 18, you should have demonstrated EBITDA growth, paid down 10-15% of senior debt, and proven the deal thesis. A refi at a higher multiple captures the multiple expansion as equity value — often doubling the sponsor equity check on a successful 18-month hold.',
      },
      {
        question: 'How does Yulia help with post-close integration?',
        answer:
          'Yulia builds a personalized 180-day plan from your deal financials and DD findings. She monitors customer retention, employee retention, revenue vs deal model, EBITDA build-back, and covenant headroom — flagging issues before they become problems. Every recommendation is tied to a KPI and a deadline.',
      },
    ],
  });

  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  // Journey=pmi accent (plum). Inline <em>/<strong> flourishes + HookHeader eyebrow.
  const accent = dark ? '#AE6D9A' : '#8F4A7A';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';

  const mistakes = [
    {
      n: '01',
      title: 'Changing too much, too fast.',
      consequence:
        'Three of eight senior engineers walk in month one. Cost to replace each at market: $180K + 4 months of ramp. Real cost: ~$2.4M of disrupted client work and one missed contract renewal.',
    },
    {
      n: '02',
      title: 'Cutting "unnecessary" costs before understanding them.',
      consequence:
        '$4,200/month contractor terminated — turns out he was the only person who knew the legacy CRM integration. Tribal knowledge cost when he walks: $180K of consulting fees and a six-week customer onboarding outage.',
    },
    {
      n: '03',
      title: 'Ignoring employee fear in week one.',
      consequence:
        '47% of employees google "what happens when a business gets sold" in the first 14 days. The ones who get answered stay. The ones who don\'t start interviewing. Each unforced departure in year 1 costs ~1× annual salary in productivity loss.',
    },
    {
      n: '04',
      title: 'Losing top customers during transition.',
      consequence:
        'Your competitors know there\'s a transition and they\'re calling your top 20 this week. One lost top-10 customer at $800K ARR is 7.3% of EBITDA — and tips your DSCR from 1.40× to 1.30×. Two lost = covenant trip.',
    },
    {
      n: '05',
      title: 'Fighting with the seller post-close.',
      consequence:
        'The seller knows the customers, the systems, and the unwritten rules. Treat them well even when the earnout creates tension. Sellers who exit angry take key relationships with them — and the buyer eats the customer churn.',
    },
    {
      n: '06',
      title: 'Squeezing margins instead of investing in growth.',
      consequence:
        'Year-1 cost cuts juice EBITDA by 8-12%. Year-3 you\'re looking at a flat business with no upgrade path and no buyer interest. Best operators reinvest 15-20% of free cash flow into growth in years 1-2.',
    },
    {
      n: '07',
      title: 'No financial reporting on Day 1.',
      consequence:
        'You can\'t hit a model you can\'t see. Monthly P&L, weekly cash flow, daily revenue — set up before you change a single thing. Every week without reporting is a week of decisions made on instinct against a debt service clock.',
    },
  ];

  return (
    <div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="integrate"
          headline={
            <>
              The deal closed. <br />
              Now make it <em className="not-italic" style={{ color: accent }}>pay</em>.
            </>
          }
          sub={
            <>
              Anna closed a $90M acquisition at $11M EBITDA. Year 1: <strong style={{ color: headingColor }}>$13.4M EBITDA</strong>.
              Year-2 refi: sponsor equity went from $20M to <strong style={{ color: accent }}>$54M</strong>. <strong>2.7× MOIC in 18 months.</strong>
            </>
          }
          dark={dark}
          accent={accent}
        />

        {/* ═══ Anna's Story ═══ */}
        <StoryBlock
          byline="Anna J.*"
          role="Search fund principal — first acquisition"
          dealLine="$90M EV · $11M EBITDA · IT services · Atlanta · 240 employees"
          body={
            <>
              <p>
                Anna had spent two years searching. When the wire hit, she took operational control of a 240-person
                IT services firm with $48M of revenue and a debt covenant that left her 14% of EBITDA headroom
                before things got bad.
              </p>
              <p className="mt-4">
                The cap stack: <strong style={{ color: headingColor }}>$50M senior</strong> at SOFR+475,{' '}
                <strong style={{ color: headingColor }}>$20M mezz</strong> at 12% + 3% PIK,{' '}
                <strong style={{ color: headingColor }}>$20M sponsor equity</strong>. Senior covenant: minimum DSCR 1.20×.
                Closing DSCR: <strong style={{ color: headingColor }}>1.40×</strong>. A 14% EBITDA dip would trip her into default.
              </p>
              <p className="mt-4">
                Sixty percent of search fund principals miss year-1 plan in the first 90 days. The math is unforgiving.
              </p>
              <p className="mt-4">
                Day 0, Anna opened a Yulia conversation and didn't close it. Yulia built the 180-day plan from her DD
                report and her cap stack model. Customer health scoring deployed Day 14. Pricing memo shipped Day 45
                (6.5% lift on contract renewals). Three unprofitable accounts terminated Day 60 (revenue −$1.1M, gross
                margin <strong style={{ color: accent }}>+$340K</strong>). New head of customer success hired Day 120.
              </p>
              <p className="mt-4">
                By Day 90, EBITDA was annualized at $11.7M (+6%). By Day 180, it was tracking <strong style={{ color: accent }}>$13.4M</strong> —
                a 22% lift in 6 months without adding headcount or changing the product. The senior bank moved DSCR
                cushion from 1.40× to 1.55×.
              </p>
              <p className="mt-4">
                Year-2 refi at <strong style={{ color: accent }}>9× × $13.4M = $120.6M</strong>. After the senior paydown
                and the value creation, Anna's $20M sponsor equity was worth ~$54M. <strong style={{ color: accent }}>2.7× MOIC in 18 months.</strong>
              </p>
              <p className="mt-4 text-base italic" style={{ color: mutedColor }}>
                The deal model was real. Yulia made it real.
              </p>
            </>
          }
          kpis={[
            { label: 'Closing EBITDA · DSCR', value: '$11M · 1.40×', sub: '14% covenant headroom' },
            { label: 'Day-180 EBITDA', value: '$13.4M', sub: '+22% in 6 months' },
            { label: '18-month sponsor MOIC', value: '2.7×', sub: '$20M → $54M equity value' },
          ]}
          dark={dark}
        />

        {/* ═══ Day 180 Calendar — hero interactive ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="The 180-day plan"
            title="Day by day. Drag the marker."
            sub="Ten milestones across Anna's first 180 days. For each: what she did, what Yulia recommended, and the KPI that moved."
            dark={dark}
          />
          <Day180Calendar dark={dark} />
        </section>

        {/* ═══ The 7 mistakes — editorial numbered list ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="What kills year 1"
            title="The 7 mistakes that destroy post-close value."
            sub="Each one has a dollar consequence. The full set is what tips a 1.40× DSCR into a 1.15× covenant trip."
            dark={dark}
          />
          <div className="space-y-6">
            {mistakes.map((m) => (
              <div
                key={m.n}
                className="grid grid-cols-12 gap-4 md:gap-8 py-6"
                style={{ borderTop: `1px solid ${border}` }}
              >
                <div className="col-span-2 md:col-span-1">
                  <span
                    className="font-headline font-black tabular-nums"
                    style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: accent, lineHeight: 1 }}
                  >
                    {m.n}
                  </span>
                </div>
                <div className="col-span-10 md:col-span-11">
                  <h3
                    className="font-headline font-black mb-2 tracking-tight"
                    style={{
                      fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
                      color: headingColor,
                      lineHeight: 1.15,
                    }}
                  >
                    {m.title}
                  </h3>
                  <p className="text-[15px] md:text-[16px] leading-relaxed" style={{ color: bodyColor }}>
                    {m.consequence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Slow vs Fast ═══ */}
        <SlowVsFast
          slowLabel="Winging it"
          slowItems={[
            { metric: 'Buyers who miss year-1 plan', value: '~60%' },
            { metric: 'Avg EBITDA dip in year 1', value: '−14%' },
            { metric: 'Time to first financial close', value: '60-90 days' },
            { metric: 'Customer health visibility', value: 'monthly at best' },
          ]}
          fastLabel="With Yulia"
          fastItems={[
            { metric: 'Anna year-1 plan adherence', value: '+22%' },
            { metric: 'Year-1 EBITDA growth', value: '+22%' },
            { metric: 'Time to first financial close', value: '30 days' },
            { metric: 'Customer health visibility', value: 'continuous' },
          ]}
          takeaway={
            <>
              The plan isn't a binder. It's a daily conversation with someone who's watching the numbers
              while you're running the business. <strong>Year 1 is when the deal model becomes real — or doesn't.</strong>
            </>
          }
          dark={dark}
        />

        {/* ═══ Sign-off chain ═══ */}
        <SignOffChain
          intro={
            <>
              Anna's first 180 days were not 180 days of guesswork. They were 180 days of decisions
              Yulia drafted, routed to the right human, waited for sign-off, executed, and logged.
              Pricing memo to head of sales. Customer save scripts to customer success. Covenant report
              to the senior bank. Year-2 refi prep to the new lender. Every step audited.
            </>
          }
          steps={[
            {
              label: 'Draft',
              yulia: 'Yulia drafts the pricing memo, save scripts, board updates',
              chain: 'From the deal model + customer health data. Specific account by specific account.',
            },
            {
              label: 'Route',
              yulia: 'Routes pricing memo to head of sales for review',
              chain: 'request_review with focus_areas: "Confirm pricing elasticity assumption on top-20."',
            },
            {
              label: 'Wait',
              yulia: 'Holds the rate-card change in queue until sign-off',
              chain: 'Sales head reviews, comments, approves. State machine advances. No surprise rate changes.',
            },
            {
              label: 'Execute',
              yulia: 'Sends customer-by-customer renewal letters, tracks responses',
              chain: 'share_document with the personalized rate. Every customer interaction logged.',
            },
            {
              label: 'Log',
              yulia: 'Chain of custody for the year-2 refi conversation',
              chain: 'New senior lender asks "show me the EBITDA build-back." Audit log = the answer.',
            },
          ]}
          bottomNote={
            <>
              60% of buyers miss year-1 plan. The ones who don't have a workflow that makes every decision visible, traceable, and approved before it ships.
            </>
          }
          dark={dark}
        />

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={<>Build your 180-day plan.</>}
          sub="Bring Yulia your deal financials and your DD report. She'll build the day-by-day plan, monitor the KPIs, and force decisions before the cliff."
          buttonLabel="Build my plan"
          onClick={goToChat}
          dark={dark}
        />
      </div>
    </div>
  );
}
