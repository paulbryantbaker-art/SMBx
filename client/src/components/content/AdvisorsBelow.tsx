import { motion } from 'framer-motion';
import { bridgeToYulia } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { CapacitySlider, SynergyBuilder } from './AdvisorTools';
import {
  HookHeader,
  StoryBlock,
  SlowVsFast,
  SectionHeader,
  SignOffChain,
  PageCTA,
  SectionBand,
  Reveal,
} from './storyBlocks';

export default function AdvisorsBelow({ dark }: { dark: boolean }) {
  usePageMeta({
    title: 'Win the pitch. Win the deal. Get paid. · Advisors with smbx.ai',
    description:
      'For M&A advisors, brokers, fundless sponsors, and PE deal teams. Win more pitches with a Baseline at the first meeting. Kill bad deals before LOI. Triple your engagements without adding partners.',
    canonical: 'https://smbx.ai/advisors',
    ogImage: 'https://smbx.ai/og-advisors.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'For advisors', url: 'https://smbx.ai/advisors' },
    ],
    faqs: [
      {
        question: 'How does Yulia help advisors win client pitches?',
        answer:
          'You walk into the first meeting with a real Baseline — comp data, add-back schedule, defensible multiple range — instead of "we\'ll come back in two weeks." First-meeting Baselines lift advisory engagement conversion from ~35% to ~62% in the practices we work with.',
      },
      {
        question: 'Can I white-label Yulia for my clients?',
        answer:
          'Yes — available on the Team, Firm, and Institutional tiers. Every document carries your firm\u2019s branding. Client data is siloed — no cross-client access, no model training on client data. Full fiduciary compliance.',
      },
      {
        question: 'How fast can I generate a CIM?',
        answer:
          'About 4 hours of partner review time, vs. 60-80 hours of analyst time at most practices. Yulia drafts the CIM from verified financials; you review, refine, and ship. Same quality, 15× faster cycle.',
      },
      {
        question: 'Will my clients know I\'m using AI?',
        answer:
          'Only if you tell them. Every document carries your branding. Yulia is your back office, not your front office. Your relationships, your judgment, your fees.',
      },
      {
        question: 'What does the economics look like for a solo advisor versus a team?',
        answer:
          'Solo advisors typically handle 6-8 active mandates; Yulia unlocks 18-22 because each mandate needs hours not weeks of analyst work. On a $12-18M average close-fee practice, that\u2019s a $4-10M revenue difference at roughly the same partner hours. For teams, Yulia replaces the junior analyst workload — more mandates per partner without proportional hires. Either way the margin profile moves from ~60% to ~78%.',
      },
      {
        question: 'What does Yulia cost for an advisory practice?',
        answer:
          'Advisors pay for the platform — we\u2019re the tool your practice runs on. Plans scale with the team and the deal cadence; see the pricing page for the current tiers. Start free, upgrade when the math works. What IS free: attorneys, CPAs, appraisers, and other professional services who join your deal workflow. They\u2019re on your deal, not their own book — no seat charge, no subscription. Tell Yulia you\u2019re a deal pro at the start of the conversation and she works with you peer-to-peer.',
      },
    ],
  });

  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? '#E8709A' : '#D44A78';
  const innerBg = dark ? 'rgba(255,255,255,0.04)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';

  const jobs = [
    {
      n: '01',
      title: 'Win the pitch.',
      preNum: '35%',
      postNum: '62%',
      preLabel: 'first-meeting conversion',
      postLabel: 'with a Baseline in hand',
      body:
        'Prospects don\'t buy "we\'ll come back to you in two weeks." They buy a number. Yulia builds the Baseline live during the pitch meeting — comp set, add-back schedule, defensible range. The prospect signs because the work is already credible.',
    },
    {
      n: '02',
      title: 'Kill the bad deals.',
      preNum: '6 weeks',
      postNum: '1 day',
      preLabel: 'to recognize a dead deal',
      postLabel: 'with The Rundown',
      body:
        'Six weeks of LOI back-and-forth before everyone realizes the deal won\'t pencil is a 1-partner-week of dead time per failed deal. The Rundown™ scores the target buyer pool in 24 hours — bad fits killed before the teaser sends. 70% reduction in dead-deal time.',
    },
    {
      n: '03',
      title: 'Make the killer pitch.',
      preNum: '60-80 hrs',
      postNum: '4 hrs',
      preLabel: 'partner time per CIM',
      postLabel: 'partner review of Yulia draft',
      body:
        'Yulia drafts the CIM from verified financials. You review, refine, and ship. Buyer outreach list: ranked by sector fit, transaction history, capital availability — 100+ targets in a day. Outreach launches three weeks earlier per deal.',
    },
    {
      n: '04',
      title: 'Find the synergy.',
      preNum: '+0.0×',
      postNum: '+0.4×',
      preLabel: 'multiple lift on close',
      postLabel: 'with synergy thesis baked into CIM',
      body:
        'Yulia builds a synergy capture model into the CIM — cost takeout, cross-sell, working capital release, year-by-year. The buyer underwrites the lift before signing the LOI. Higher LOIs because the upside is already on the page. On a $1.2M average fee, that\'s ~$48K more per deal.',
    },
  ];

  // Advisors page audience = deal pros and brokers only. Attorneys / CPAs /
  // real-estate brokers / wealth managers get free access when they appear on
  // a deal workflow but they aren't the audience of THIS page.
  const advisorTypes = [
    {
      icon: 'storefront',
      tier: 'Boutique',
      title: 'Sell-side M&A advisors',
      desc: 'Run 3× the engagements with the same partner team. White-label CIMs. First-meeting Baselines. Multi-client pipeline view.',
      size: '$5M-$300M EV',
    },
    {
      icon: 'business',
      tier: 'Mid-market',
      title: 'Business brokers',
      desc: 'Walk into every listing with a defensible value range and an add-back schedule. Sellers sign, buyers underwrite, fees scale.',
      size: '$1M-$25M EV',
    },
    {
      icon: 'account_balance',
      tier: 'Fundless',
      title: 'Independent sponsors',
      desc: 'Build the cap stack in one afternoon. Draft the LP pitch from the modeled stack. Close in 4-5 months instead of 9-11.',
      size: '$50M-$500M EV',
    },
    {
      icon: 'search',
      tier: 'Search',
      title: 'Search-fund advisors & principals',
      desc: 'Screen 10× more targets. The Rundown on every candidate before teaser. Cap stack on every short-list deal. Close faster.',
      size: '$5M-$50M EBITDA',
    },
    {
      icon: 'groups',
      tier: 'PE',
      title: 'PE deal teams',
      desc: 'CIM throughput 8×. Same analysts, same thesis, more shots on goal. Thesis clarity in the first 48 hours of a new CIM.',
      size: '$100M-$1B EV',
    },
    {
      icon: 'handshake',
      tier: 'Family office',
      title: 'Family-office deal teams',
      desc: 'Multi-deal portfolio view across the existing book. Synergy modeling at the next acquisition. One platform for every pipeline stage.',
      size: '$25M-$500M EV',
    },
  ];

  return (
    <div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="advisors"
          headline={
            <>
              <span className="block">Win the pitch.</span>
              <span className="block">Win the deal.</span>
              <em className="not-italic block" style={{ color: accent }}>Get paid.</em>
            </>
          }
          sub={
            <>
              You are a team of one. <strong>Yulia is a team of three.</strong> First-meeting Baseline, CIM by Friday, buyer list built in an afternoon.
            </>
          }
          dark={dark}
          accent={accent}
        />

        {/* ═══ How the pricing works for advisors — honest and direct. ═══ */}
        <div
          className="rounded-2xl mb-20 p-6 md:p-8 max-w-4xl"
          style={{
            background: dark ? 'rgba(232,112,154,0.08)' : 'rgba(212,74,120,0.05)',
            border: dark ? '1px solid rgba(232,112,154,0.22)' : '1px solid rgba(212,74,120,0.16)',
          }}
        >
          <div
            className="text-[10px] font-bold uppercase mb-3"
            style={{ color: accent, letterSpacing: '0.18em' }}
          >
            smbx.ai · advisor pricing
          </div>
          <p
            className="text-[16px] md:text-[17px] leading-relaxed"
            style={{ color: headingColor }}
          >
            You pay for the platform. Your clients don't — unless they engage Yulia directly.
            The attorneys, CPAs, appraisers, and other professional services who join your deal workflow run free
            (they're on your deal, not their own book). See the pricing page for current advisor plans — start free,
            upgrade when the math works.
          </p>
        </div>

        {/* ═══ Story ═══ */}
        <StoryBlock
          byline="Reese & Hammond*"
          role="Boutique sell-side M&A advisory · 4 partners"
          dealLine="$80M-$300M EV mandates · sell-side · upper middle market"
          body={
            <>
              <p>
                Four partners. No junior bench. <strong style={{ color: headingColor }}>$4.8M</strong> in annual revenue, and a ceiling that neither relationships nor weekend work would break. Reese & Hammond&rsquo;s problem was never demand. It was production hours.
              </p>
              <p className="mt-4">
                Every CIM: 60-80 partner hours. Every buyer cycle: 40. Eight active mandates was the ceiling. At a 50% close rate and a <strong style={{ color: headingColor }}>$1.2M</strong> average fee, the number held — but only because the partners stopped going to their kids&rsquo; soccer games.
              </p>
              <p className="mt-4">
                Yulia fixed the first meeting first. The Baseline — comp set, add-back schedule, defensible multiple range — built live while the prospect watched. No &ldquo;we&rsquo;ll come back to you in two weeks.&rdquo; Engagement conversion ran <strong style={{ color: accent }}>35% → 62%</strong> inside a quarter. Not because the pitch got better. Because the work was already done.
              </p>
              <p className="mt-4">
                The CIM cycle compressed next. Yulia drafted from verified financials; the partner reviewed and refined. What used to take 60-80 hours of their own time shipped in <strong style={{ color: accent }}>4 hours</strong>. Same quality. Fifteen times the cycle.
              </p>
              <p className="mt-4">
                Then the synergy thesis landed on page 1 of every CIM — cost takeout, cross-sell, working-capital release, priced before the LOI hit the table. Buyers underwrote the lift instead of negotiating it out. Close multiple: <strong style={{ color: accent }}>+0.4×</strong> across the portfolio.
              </p>
              <p className="mt-4">
                Year two looked different. <strong style={{ color: accent }}>22 active mandates. 60% close rate. $16.5M revenue.</strong> Same four partners. No new hires. No lost weekends.
              </p>
              <p className="mt-4 text-base italic" style={{ color: mutedColor }}>
                The bottleneck was never relationships. It was production hours. Yulia gave them back.
              </p>
            </>
          }
          kpis={[
            { label: 'Pre-Yulia annual', value: '$4.8M', sub: '8 mandates · 50% · 60% margin' },
            { label: 'Post-Yulia annual', value: '$16.5M', sub: '22 mandates · 60% · 78% margin' },
            { label: 'Same 4 partners', value: '3.4×', sub: 'revenue, no headcount added' },
          ]}
          dark={dark}
          accent={accent}
        />

        {/* ═══ The 4 Jobs — editorial ═══ */}
        <Reveal className="mb-28">
          <SectionHeader
            label="Your 4 jobs"
            title="Win the pitch. Kill the bad. Make the killer pitch. Find the synergy."
            sub="The four things that determine whether you make money this year. Yulia accelerates each one."
            dark={dark}
            accent={accent}
          />
          <div className="space-y-12">
            {jobs.map((job) => (
              <div
                key={job.n}
                className="grid grid-cols-12 gap-6 md:gap-8 pt-8"
                style={{ borderTop: `1px solid ${border}` }}
              >
                {/* Number + delta */}
                <div className="col-span-12 md:col-span-4">
                  <span
                    className="font-headline font-black tabular-nums block mb-2"
                    style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: accent, lineHeight: 0.95 }}
                  >
                    {job.n}
                  </span>
                  <h3
                    className="font-headline font-black tracking-tight mb-5"
                    style={{
                      fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                      color: headingColor,
                      lineHeight: 1.05,
                    }}
                  >
                    {job.title}
                  </h3>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: innerBg, border: `1px solid ${border}` }}
                  >
                    <div className="flex items-baseline justify-between mb-2 opacity-50">
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: mutedColor }}>
                        {job.preLabel}
                      </span>
                      <span
                        className="font-headline font-black tabular-nums line-through"
                        style={{ fontSize: '1.25rem', color: headingColor }}
                      >
                        {job.preNum}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: accent }}>
                        {job.postLabel}
                      </span>
                      <span
                        className="font-headline font-black tabular-nums"
                        style={{ fontSize: '1.5rem', color: accent }}
                      >
                        {job.postNum}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="col-span-12 md:col-span-8">
                  <p
                    className="text-[17px] md:text-[19px] leading-[1.65] editorial"
                    style={{ color: bodyColor }}
                  >
                    {job.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ═══ Capacity Slider — cinematic anchor (full-bleed immersive band) ═══ */}
        <SectionBand tone="immersive" dark={dark}>
          <SectionHeader
            label="Interactive · capacity"
            title="What does 22 active mandates look like?"
            sub="The constraint on an advisory practice isn't relationships or judgment — it's partner production hours. Drag from 6 to 22 mandates and watch how Yulia rebalances your economics (revenue, margin, partner hours, utilization) without adding headcount."
            dark={dark}
            accent={accent}
          />
          <CapacitySlider dark={dark} />
        </SectionBand>

        {/* ═══ Synergy Builder ═══ */}
        <Reveal className="mb-28">
          <SectionHeader
            label="Interactive · synergy"
            title="Show the buyer what they'll capture."
            sub="A synergy thesis on page 1 of the CIM changes LOI economics. Model the cost takeout, cross-sell, and working-capital release your buyer will actually execute — then watch the valuation (and your fee) lift before anyone signs."
            dark={dark}
            accent={accent}
          />
          <SynergyBuilder dark={dark} />
        </Reveal>

        {/* ═══ Slow vs Fast ═══ */}
        <SlowVsFast
          slowLabel="Pre-Yulia"
          slowItems={[
            { metric: 'Active mandates', value: '6-8' },
            { metric: 'CIM cycle (partner hrs)', value: '60-80' },
            { metric: 'Engagement conversion', value: '~35%' },
            { metric: 'Annual revenue', value: '~$4.8M' },
          ]}
          fastLabel="With Yulia"
          fastItems={[
            { metric: 'Active mandates', value: '20-22' },
            { metric: 'CIM cycle (partner hrs)', value: '4' },
            { metric: 'Engagement conversion', value: '~62%' },
            { metric: 'Annual revenue', value: '~$16.5M' },
          ]}
          takeaway={
            <>
              The relationships are still yours. The judgment is still yours. Yulia just removes the production
              bottleneck. <strong>Same 4 partners. 3.4× the revenue.</strong>
            </>
          }
          dark={dark}
          accent={accent}
        />

        {/* ═══ Who uses this — asymmetric editorial grid ═══
            Six tiles in a 6-col grid with varied widths (4·2 / 3·3 / 2·4)
            so each row breaks the monoculture of identical card grids. The
            "feature" tiles (col-span-4) carry a soft accent gradient corner
            to read as primary; the compact tiles (col-span-2) hold their own
            without noise. Staggered scroll reveal layers the entrance. */}
        <Reveal className="mb-28">
          <SectionHeader
            label="Who runs this"
            title="From boutique shops to $1B funds."
            sub="Yulia adapts to the deal size and the team structure. Same product, different depth, different speed."
            dark={dark}
            accent={accent}
          />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-5">
            {advisorTypes.map((a, i) => {
              // Asymmetric layout: feature (4-col) / compact (2-col) / split (3·3)
              // Pattern repeats per row: row1 = 4·2, row2 = 3·3, row3 = 2·4
              const layout = [
                'col-span-2 md:col-span-4',  // 1 — feature
                'col-span-2 md:col-span-2',  // 2 — compact
                'col-span-2 md:col-span-3',  // 3 — split
                'col-span-2 md:col-span-3',  // 4 — split
                'col-span-2 md:col-span-2',  // 5 — compact
                'col-span-2 md:col-span-4',  // 6 — feature
              ][i] || 'col-span-2 md:col-span-3';
              const isFeature = layout.includes('col-span-4');
              return (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-8%' }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`${layout} rounded-2xl p-7 relative overflow-hidden transition-transform duration-200 ease-out hover:-translate-y-0.5`}
                  style={{
                    background: innerBg,
                    border: `1px solid ${isFeature ? `${accent}33` : border}`,
                  }}
                >
                  {isFeature && (
                    <div
                      aria-hidden
                      className="absolute top-0 right-0 w-40 h-40 opacity-[0.07] pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at top right, ${accent}, transparent 70%)`,
                      }}
                    />
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="material-symbols-outlined"
                        style={{ color: accent, fontSize: isFeature ? 36 : 28 }}
                      >
                        {a.icon}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                        style={{
                          background: dark ? 'rgba(232,112,154,0.1)' : 'rgba(212,74,120,0.1)',
                          color: accent,
                        }}
                      >
                        {a.tier}
                      </span>
                    </div>
                    <h3
                      className="font-headline font-black tracking-tight mb-2"
                      style={{
                        color: headingColor,
                        lineHeight: 1.15,
                        fontSize: isFeature ? '1.35rem' : '1.05rem',
                      }}
                    >
                      {a.title}
                    </h3>
                    <p
                      className="leading-relaxed mb-4"
                      style={{
                        color: bodyColor,
                        fontSize: isFeature ? '15px' : '13.5px',
                      }}
                    >
                      {a.desc}
                    </p>
                    <p className="text-[11px] font-mono" style={{ color: mutedColor }}>
                      {a.size}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Reveal>

        {/* ═══ Sign-off chain ═══ */}
        <SectionBand tone="alt" dark={dark}>
          <SignOffChain
            intro={
              <>
                Reese & Hammond don't just draft CIMs faster. They run the entire deal chain on Yulia.
                Every CIM is drafted by Yulia, reviewed by the partner, routed to the seller's CPA for
                add-back verification, signed off, sent to the buyer pool with watermarks, and logged.
                When the buyer's QoE firm calls three months later asking for line-item provenance,
                the answer is in the audit log — not in someone's email. <strong>And every attorney,
                CPA, and broker on the deal runs the platform free.</strong>
              </>
            }
            steps={[
              {
                label: 'Draft',
                yulia: 'Yulia drafts the CIM, teaser, buyer outreach',
                chain: '4 hours of partner review instead of 60-80 hours of partner work.',
              },
              {
                label: 'Route',
                yulia: "Routes draft to the seller's CPA + counsel",
                chain: 'request_review with focus_areas. Both pros free on the platform.',
              },
              {
                label: 'Wait',
                yulia: 'Holds CIM in review until both pros sign off',
                chain: 'Two-stage review chain. State machine advances on both approvals.',
              },
              {
                label: 'Execute',
                yulia: 'Sends teaser to ranked buyer pool, CIM behind NDA',
                chain: 'share_document with watermark, NDA gate, view tracking, sharer notified on view.',
              },
              {
                label: 'Log',
                yulia: 'Chain of custody for the QoE conversation 3 months out',
                chain: "Buyer's QoE asks for line-item source. Audit log answers in 30 seconds.",
              },
            ]}
            bottomNote={
              <>
                The relationships are still yours. The judgment is still yours. The fee is still yours. Yulia just removes the production bottleneck and gives you a chain of custody that survives the buyer's lawyer, the buyer's QoE, and the buyer's senior bank.
              </>
            }
            dark={dark}
            accent={accent}
          />
        </SectionBand>

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={<>Win your next pitch.</>}
          sub="Start free. Run a real client engagement before you commit. Walk in with a defensible Baseline. Draft a CIM in four hours. See the pipeline. The attorneys, CPAs, and appraisers who join your deal run free — they're on your deal, not their own book. Your relationships stay yours."
          buttonLabel="Start now — free"
          onClick={() =>
            bridgeToYulia(
              "I run an M&A advisory practice. Help me understand how Yulia fits. We handle roughly [X] active mandates in [industry] at $[Y]M-$[Z]M EV, with engagements running [N] weeks pitch-to-close."
            )
          }
          dark={dark}
          accent={accent}
        />
      </div>
    </div>
  );
}
