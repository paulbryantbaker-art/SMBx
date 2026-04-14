import { goToChat, bridgeToYulia } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { ConversationTyping } from './animations';
import { BaselineCalculator } from './LandingCalculators';
import { MultipleMap } from './MultipleMap';
import {
  HookHeader,
  StoryBlock,
  BrandedTermCard,
  SlowVsFast,
  SectionHeader,
  SignOffChain,
  PageCTA,
  JourneyProvider,
} from './storyBlocks';

export default function SellBelow({ dark }: { dark: boolean }) {
  usePageMeta({
    title: 'Win the sell-side mandate · smbx.ai',
    description:
      'Walk into your sell-side pitch with the Baseline already in hand. Show the seller their real number at the first meeting. Win mandates the other brokers lose. Free for verified deal professionals.',
    canonical: 'https://smbx.ai/sell',
    ogImage: 'https://smbx.ai/og-sell.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Sell a business', url: 'https://smbx.ai/sell' },
    ],
    faqs: [
      {
        question: 'How does Yulia help me win sell-side pitches?',
        answer:
          'You show the prospect a real Baseline at the first meeting — comp data, add-back schedule, defensible multiple range — instead of "we will come back in two weeks." Engagement conversion lifts from ~35% to ~62% in the practices we work with. Prospects sign because the work is already credible.',
      },
      {
        question: 'I am the seller, not a broker. Can I still use this?',
        answer:
          'Yes. The Baseline is built for you whether you bring it to a broker, an M&A advisor, or take it directly to a buyer. Walk into your next pitch (or your next inbound) with a defensible number, the add-back schedule that supports it, and the comp data that backs the multiple. Most owners discover their business is worth 20-50% more than the rule of thumb their CPA quoted.',
      },
      {
        question: 'How much can a business actually sell for?',
        answer:
          'It depends on five things: industry comp multiples, real EBITDA (not the tax-return number), customer concentration, growth trajectory, and owner dependency. Yulia runs all five against 2024-2025 mid-market consensus ranges, NAICS benchmarks, and actual deals closing in the sector — and gives you a defensible Baseline range, usually higher than the CPA rule of thumb.',
      },
      {
        question: 'What is Blind Equity™?',
        answer:
          'The gap between reported EBITDA and real EBITDA — the legitimate add-backs the CPA optimized away for tax savings. Above-market rent paid to the owner\'s real-estate LLC, family member compensation above market, one-time legal fees, personal vehicles, discontinued product losses. On a $15M+ EBITDA business, Blind Equity is usually $1-3M, which translates to $10-25M of valuation at typical industry multiples.',
      },
      {
        question: 'What multiples do upper middle market businesses sell for?',
        answer:
          'For $5M-$100M EBITDA businesses: specialty distribution 6-9×, healthcare services 9-12×, tech-enabled services 9-13×, insurance brokerage 10-14×, vertical SaaS 12-20×. Customer concentration, growth rate, and recurring revenue mix move you within the range.',
      },
      {
        question: 'Are deal professionals really free?',
        answer:
          'Yes. Verified M&A advisors, brokers, attorneys, CPAs, real estate brokers, wealth managers, and appraisers get full Pro features for free, forever. Your sellers pay their own subscription if they engage the platform directly. Yulia recognizes you in conversation and switches to peer-to-peer mode automatically.',
      },
    ],
  });

  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? '#E8709A' : '#D44A78';

  return (
    <JourneyProvider value="sell"><div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook — repositioned for brokers as the dominant audience ═══ */}
        <HookHeader
          eyebrow="sell"
          headline={
            <>
              Walk in with the <em className="not-italic" style={{ color: accent }}>number.</em><br />
              Win the mandate.
            </>
          }
          sub={
            <>
              Sarah's seller thought <strong style={{ color: headingColor }}>$90M</strong>. Sarah walked in with a defensible{' '}
              <strong style={{ color: accent }}>$155M</strong> Baseline in 90 seconds. She won the mandate over two other brokers who said
              "we'll come back to you in two weeks." Closed at $154.8M. <strong style={{ color: headingColor }}>Fee: $2.7M.</strong>
            </>
          }
          dark={dark}
        />

        {/* ═══ Audience connector ═══ */}
        <p
          className="text-[13px] md:text-[14px] leading-relaxed mb-16 max-w-3xl"
          style={{ color: mutedColor }}
        >
          Built for the brokers, M&amp;A advisors, search funders, and family-office deal teams running sell-side mandates day in, day out.
          Owners can run their own Baseline too — most discover their business is worth 20-50% more than the rule of thumb. <strong style={{ color: accent }}>Verified deal professionals are free, forever.</strong>
        </p>

        {/* ═══ Multiple Map — leads (cool, sexy, click-to-position) ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Step 1 · The Multiple Map"
            title="See where your seller lands in their comp set."
            sub="Pick the industry. Click the chart to place the pin. The position tells you whether the seller is in the premium zone, the middle, or the bottom — and what's holding them back from the next half-turn of multiple. Bring the chart to the pitch."
            dark={dark}
          />
          <MultipleMap dark={dark} ebitda={18} />
        </section>

        {/* ═══ Baseline Calculator — second ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Step 2 · Baseline™"
            title="Run the number now."
            sub="Pick the industry, drag in the revenue, watch the multiple range pull from the 2024-2025 mid-market consensus. You'll have a defensible Baseline range in 30 seconds — the same math the buyer's IB will run."
            dark={dark}
          />
          <BaselineCalculator dark={dark} />
        </section>

        {/* ═══ The two products ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="The two numbers your buyer cares about"
            title="The Baseline. The Blind Equity."
            dark={dark}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BrandedTermCard
              term="Baseline"
              oneLiner="The number you walk into the pitch with."
              definition="The seller's industry comp multiple, applied to their real EBITDA, adjusted for the levers buyers actually price: customer concentration, growth, owner dependency, recurring revenue. Not a rule of thumb — the same math the buyer's IB will run."
              example="A $18M EBITDA specialty distributor at the 75th percentile of its comp set: 8.6× Baseline = $155M. A naive 5× rule of thumb says $90M. The difference is the comp set you cite at the first meeting."
              onCTA={() =>
                bridgeToYulia(
                  "Run a Baseline for my next sell-side prospect. The business is in [industry] with about $XM EBITDA."
                )
              }
              ctaLabel="Run a Baseline"
              dark={dark}
            />
            <BrandedTermCard
              term="Blind Equity"
              oneLiner="The earnings hiding in your seller's tax return."
              definition="The gap between reported EBITDA and real EBITDA. Above-market rent to the owner's real-estate LLC, family compensation above market, one-time legal/litigation, personal vehicles & phones, discontinued product line losses. Legitimate add-backs the CPA optimized away for tax savings — and that move the multiple at the negotiation table."
              example="Mark's reported EBITDA was $16.2M. Sarah ran the P&L through Yulia and surfaced $1.8M of Blind Equity across 5 categories. Real EBITDA: $18M. At his 8.6× Baseline, that $1.8M of hidden EBITDA is worth $15.5M to the seller — and Sarah's success fee scales with it."
              onCTA={() =>
                bridgeToYulia(
                  "Find the Blind Equity in this deal. Walk me through the add-backs the seller's CPA missed."
                )
              }
              ctaLabel="Find Blind Equity"
              dark={dark}
            />
          </div>
        </section>

        {/* ═══ The Story — now told from the broker's perspective ═══ */}
        <StoryBlock
          byline="Sarah V.*"
          role="Partner — boutique sell-side M&A advisory, Chicago"
          dealLine="6 partners · sell-side mandates · $50M-$300M EV"
          body={
            <>
              <p>
                Mark D. owned a third-generation specialty industrial distributor in the Midwest. <strong style={{ color: headingColor }}>$112M revenue, $16.2M reported EBITDA, 28 years operating.</strong> When he started thinking about exit, his CPA's friend gave him the rule of thumb: <em>"5× EBITDA, you're worth $90M."</em> Mark started taking pitch meetings with three brokers.
              </p>
              <p className="mt-4">
                Two of the brokers said the same thing: <em>"Give us two weeks. We'll pull comps and come back with a Baseline range."</em>
              </p>
              <p className="mt-4">
                Sarah didn't. She opened Yulia in the meeting and said <strong style={{ color: headingColor }}>"let me run the comps now."</strong>
              </p>
              <p className="mt-4">
                Ninety seconds later: specialty distribution at $15M+ EBITDA trades <strong style={{ color: accent }}>7.2× median, 9.4× at the 75th percentile</strong> in the 2024-2025 mid-market consensus. The 5× rule of thumb came from the sub-$5M cohort and didn't apply at Mark's size. Sarah said: <em>"Walk me through your add-backs while I pull the rest of this up."</em>
              </p>
              <p className="mt-4">
                In the next 8 minutes, Yulia surfaced <strong style={{ color: accent }}>$1.8M of Blind Equity</strong> across 5 categories — above-market rent to Mark's real-estate LLC ($720K), above-market family compensation ($420K), one-time litigation ($380K), discontinued product line losses ($190K), the usual personal vehicles and phones ($90K). Real EBITDA: <strong style={{ color: accent }}>$18M flat.</strong>
              </p>
              <p className="mt-4">
                Sarah's screen showed Mark a Baseline of <strong style={{ color: accent }}>$154-180M</strong>, contingent on a customer concentration fix she could run in 6 months. <strong>Mark signed the engagement letter that afternoon.</strong> Eight months later Sarah closed at 8.6× × $18M = <strong style={{ color: accent }}>$154.8M.</strong> Her firm's fee: 1.75% × $154.8M = <strong style={{ color: accent }}>$2.7M.</strong>
              </p>
              <p className="mt-4">
                The other two brokers — the ones who said "give us two weeks" — won zero of the three pitch meetings they took that month. Sarah won all three.
              </p>
              <p className="mt-4 text-base italic" style={{ color: mutedColor }}>
                The broker who walks in with the number wins the mandate. Every time.
              </p>
            </>
          }
          kpis={[
            { label: 'CPA rule-of-thumb', value: '$90M', sub: '5× a wrong EBITDA' },
            { label: "Sarah's Baseline at the pitch", value: '$155M', sub: '8.6× × $18M EBITDA' },
            { label: "Sarah's fee on the close", value: '$2.7M', sub: '1.75% × $154.8M' },
          ]}
          dark={dark}
        />

        {/* ═══ Slow vs Fast — broker context ═══ */}
        <SlowVsFast
          slowLabel="Pitching cold"
          slowItems={[
            { metric: 'First-meeting conversion', value: '~35%' },
            { metric: 'Time from prospect → Baseline', value: '2-3 weeks' },
            { metric: 'Source of the number', value: 'Rule of thumb' },
            { metric: 'Add-back schedule', value: 'Comes later' },
          ]}
          fastLabel="Walking in prepared"
          fastItems={[
            { metric: 'First-meeting conversion', value: '~62%' },
            { metric: 'Time from prospect → Baseline', value: '90 seconds' },
            { metric: 'Source of the number', value: '2024-2025 comps' },
            { metric: 'Add-back schedule', value: 'In the meeting' },
          ]}
          takeaway={
            <>
              Three pitches a month × 27% lift in conversion × $1-3M average fee = the difference between 8 mandates a year and 22.{' '}
              <strong>Yulia is free for verified brokers — every pitch you take, every mandate you win, no per-deal cost.</strong>
            </>
          }
          dark={dark}
        />

        {/* ═══ Yulia Says ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Yulia says"
            title="Three turns. Your seller's number, in the meeting."
            dark={dark}
          />
          <div
            className="rounded-2xl p-6 md:p-10 max-w-3xl"
            style={{ background: '#0f1012', border: `1px solid rgba(255,255,255,0.06)` }}
          >
            <ConversationTyping
              messages={[
                {
                  type: 'user',
                  content: (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed">
                      I'm in a pitch meeting right now. Specialty industrial distribution. $112M revenue, $16.2M EBITDA on the tax return.
                      Top-5 customers ~31%. What can I tell this seller?
                    </div>
                  ),
                },
                {
                  type: 'ai',
                  content: (
                    <div className="flex gap-3 items-start mt-4">
                      <div className="w-8 h-8 rounded-full bg-[#D44A78] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        Y
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed">
                        Two things to tell them right now. (1) Their tax return EBITDA is almost certainly below their real EBITDA — distributors at this size typically have $1-3M of legitimate Blind Equity. (2) 31% top-5 concentration is outside the tight comp tolerance, which knocks them out of the 75th percentile multiple. Want me to walk the P&L for add-backs while you keep them talking?
                      </div>
                    </div>
                  ),
                },
                {
                  type: 'user',
                  content: (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed mt-4">
                      Yes. Pasting last 3 years of P&amp;L now.
                    </div>
                  ),
                },
                {
                  type: 'ai',
                  content: (
                    <div className="flex gap-3 items-start mt-4">
                      <div className="w-8 h-8 rounded-full bg-[#D44A78] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        Y
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed">
                        Found <span className="text-[#ffb2bf] font-bold">$1.8M of Blind Equity</span> across 5 categories. Real EBITDA: $18M.
                        At median multiples for the sector with 31% concentration: <strong>7.2× = $130M.</strong> Fix concentration to 23% over 6 months and you move to the 75th percentile: <strong>8.6× = $155M.</strong>
                        That's their Baseline. Want me to draft the add-back schedule and the concentration fix plan you can hand them as a leave-behind?
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* ═══ Sign-off chain — broker workflow ═══ */}
        <SignOffChain
          intro={
            <>
              Sarah doesn't just win the pitch. She runs the deal. After Mark signs the engagement, Yulia drafts the
              CIM from the verified financials, routes the add-back schedule to Mark's CPA for verification, holds the
              CIM in queue until both sign off, sends the teaser to the ranked buyer pool, and logs every version of
              every document. When the buyer's QoE firm asks for line-item provenance three months later, the answer
              is in the audit log. Sarah keeps her relationships, her judgment, and her fee.
            </>
          }
          steps={[
            {
              label: 'Draft',
              yulia: 'Yulia drafts the CIM + add-back schedule + buyer outreach',
              chain: 'From the verified financials Sarah uploaded. 4 hours of partner review instead of 60-80.',
            },
            {
              label: 'Route',
              yulia: "Routes the add-back schedule to Mark's CPA",
              chain: 'request_review with focus_areas: "Confirm rent above-market, family comp, one-time legal."',
            },
            {
              label: 'Wait',
              yulia: "Holds the CIM in 'review' until CPA + Mark sign off",
              chain: 'Two-stage review chain. State machine advances on approvals. CPA notes attached.',
            },
            {
              label: 'Execute',
              yulia: 'Sends teaser to ranked buyer pool, CIM behind NDA',
              chain: 'share_document with watermark, NDA gate, view tracking. Sarah notified on every view.',
            },
            {
              label: 'Log',
              yulia: 'Chain of custody for the QoE conversation 3 months out',
              chain: "Buyer's QoE asks for line-item source. Audit log answers in 30 seconds.",
            },
          ]}
          bottomNote={
            <>
              The relationship with Mark is still Sarah's. The judgment calls are still Sarah's. The $2.7M fee is still Sarah's. Yulia just removes the production bottleneck and gives the deal a chain of custody that survives the buyer's lawyer, the buyer's QoE, and the buyer's senior bank.
            </>
          }
          dark={dark}
        />

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={<>Run a Baseline for your next pitch.</>}
          sub="Tell Yulia about the seller. She'll build the Baseline, find the Blind Equity, and hand you the add-back schedule to walk into the meeting with. Verified brokers and deal pros are free, forever."
          buttonLabel="Run a Baseline"
          onClick={goToChat}
          dark={dark}
        />
      </div>
    </div></JourneyProvider>
  );
}
