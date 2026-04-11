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
  PageCTA,
} from './storyBlocks';

export default function SellBelow({ dark }: { dark: boolean }) {
  usePageMeta({
    title: "What's your business worth? · Sell with smbx.ai",
    description:
      'Walk into your broker meeting with the number already in hand. Real Baseline valuation, Blind Equity add-backs, industry comps. AI deal intelligence for upper middle market exits.',
    canonical: 'https://smbx.ai/sell',
    faqs: [
      {
        question: 'How much can my business actually sell for?',
        answer:
          'It depends on five things: industry comp multiples, your real EBITDA (not the tax-return number), customer concentration, growth trajectory, and owner dependency. Yulia runs all five against PitchBook + GF Data 2024 comp sets and gives you a defensible Baseline range — usually higher than the rule-of-thumb number your CPA quoted.',
      },
      {
        question: 'What is Blind Equity?',
        answer:
          'Blind Equity is the gap between your reported EBITDA and your real EBITDA — the legitimate add-backs your CPA optimized away for tax savings. Above-market rent paid to your real-estate LLC, family member compensation above market, one-time legal fees, personal vehicles. On a $15M+ EBITDA business, Blind Equity is usually $1-3M, which translates to $10-25M of valuation at typical industry multiples.',
      },
      {
        question: 'What multiples do upper middle market businesses sell for?',
        answer:
          'For $5M-$100M EBITDA businesses, multiples vary by sector: specialty distribution 6-9×, healthcare services 9-12×, tech-enabled services 9-13×, insurance brokerage 10-14×, vertical SaaS 12-20×. Customer concentration, growth rate, and recurring revenue mix move you within the range.',
      },
      {
        question: 'Should I run my own valuation before talking to a broker?',
        answer:
          'Yes. Walking in with your real Baseline, your add-back schedule, and your industry comps gives your advisor what they need to run a competitive process and negotiate to the top of the range. Yulia builds the analysis you bring; your broker runs the deal.',
      },
    ],
  });

  const bg = dark ? '#0f1012' : '#f9f7f1';
  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const bodyColor = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const accent = dark ? '#E8709A' : '#D44A78';

  return (
    <div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="sell"
          headline={
            <>
              What's your business <em className="not-italic" style={{ color: accent }}>actually</em> worth?
            </>
          }
          sub={
            <>
              Mark thought <strong style={{ color: headingColor }}>$90M</strong>. The real answer was{' '}
              <strong style={{ color: accent }}>$155M</strong>. Walk into your broker meeting with the number already in hand.
            </>
          }
          dark={dark}
        />

        {/* ═══ Baseline Calculator — leads ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Step 1 · Baseline™"
            title="Find your number now."
            sub="Drop in your revenue, EBITDA, and a couple of fundamentals. You'll have a defensible Baseline range in 30 seconds — built on the same comp data your buyer will use."
            dark={dark}
          />
          <BaselineCalculator dark={dark} />
        </section>

        {/* ═══ The two products ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="The two numbers your buyer cares about"
            title="Your Baseline. Your Blind Equity."
            dark={dark}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BrandedTermCard
              term="Baseline"
              oneLiner="The number a buyer uses to write a check."
              definition="Your industry's real comp multiple, applied to your real EBITDA, adjusted for the levers buyers actually price: customer concentration, growth, owner dependency, recurring revenue. Not a rule of thumb."
              example="A $18M EBITDA specialty distributor at the 75th percentile of its comp set: 8.6× Baseline = $155M. A 5× rule of thumb says $90M. The difference is the comp set."
              onCTA={() =>
                bridgeToYulia(
                  "I want my Baseline. My business does about $XM EBITDA in [industry]. Can you build it?"
                )
              }
              ctaLabel="Run my Baseline"
              dark={dark}
            />
            <BrandedTermCard
              term="Blind Equity"
              oneLiner="The earnings hiding in your tax return."
              definition="The gap between reported EBITDA and real EBITDA. Above-market rent to your own real-estate LLC, family compensation above market, one-time legal/litigation, personal vehicles & phones, discontinued product line losses. Legitimate add-backs your CPA optimized away for tax savings."
              example="Mark's reported EBITDA was $16.2M. Yulia found $1.8M of Blind Equity across 5 categories. Real EBITDA: $18M. At his 8.6× Baseline, that $1.8M of hidden EBITDA is worth $15.5M."
              onCTA={() =>
                bridgeToYulia(
                  "Find my Blind Equity. Walk me through the add-backs my CPA missed."
                )
              }
              ctaLabel="Find my Blind Equity"
              dark={dark}
            />
          </div>
        </section>

        {/* ═══ Multiple Map ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Step 2 · The Multiple Map"
            title="See where your business lands in its comp set."
            sub="Pick your industry. Drag the pin onto the chart. The position tells you whether you're in the premium zone, the middle, or the bottom — and what's holding you back from the next half-turn of multiple."
            dark={dark}
          />
          <MultipleMap dark={dark} ebitda={18} />
        </section>

        {/* ═══ The Story ═══ */}
        <StoryBlock
          byline="Mark D.*"
          role="Owner — specialty industrial distribution"
          dealLine="$112M revenue · $18M EBITDA · Midwest · 28 yrs"
          body={
            <>
              <p>
                Mark's family had run the business for two generations. Quiet, profitable, top-5 customers
                concentrated at 31% of revenue, 4% three-year CAGR. When he started thinking about exit, his
                CPA's friend — a regional accountant — gave him the rule of thumb: <strong style={{ color: headingColor }}>"5× EBITDA, you're worth $90M."</strong>
              </p>
              <p className="mt-4">
                Two things were wrong with that number.
              </p>
              <p className="mt-4">
                <strong style={{ color: headingColor }}>One:</strong> the comp set. Specialty distribution at $15M+ EBITDA actually trades at <strong style={{ color: accent }}>7.2× median, 9.4× at the 75th percentile</strong> in the 2024 PitchBook + GF Data set, not 5×. The 5× number comes from the sub-$5M cohort and doesn't apply at his size.
              </p>
              <p className="mt-4">
                <strong style={{ color: headingColor }}>Two:</strong> his EBITDA was wrong too. Yulia walked the P&L line by line and surfaced <strong style={{ color: accent }}>$1.8M of Blind Equity</strong> his CPA had legitimately optimized away for tax purposes — $720K of above-market rent to his own real-estate LLC, $420K of family compensation above market, $380K of one-time litigation, $190K of discontinued product line losses, plus the usual personal vehicles and phones. Real EBITDA: <strong style={{ color: accent }}>$18M flat.</strong>
              </p>
              <p className="mt-4">
                Customer concentration was the last lever. At 31% top-5, Mark was outside the comp set's 25% tolerance — knocking him into the middle of the range, not the top. Yulia recommended a 6-month run-rate fix: shift $4.2M of revenue from the #1 account into two pipeline accounts already underwritten. Six months later, top-5 was at 23%.
              </p>
              <p className="mt-4">
                Mark walked into his M&A advisor meeting with the comp data, the add-back schedule, and the concentration fix already in hand. The advisor ran a competitive process with seven strategic buyers. Mark closed at <strong style={{ color: accent }}>8.6× × $18M = $154.8M.</strong> Sixty-five million dollars more than his CPA's number.
              </p>
              <p className="mt-4 text-base italic" style={{ color: mutedColor }}>
                This isn't about beating the broker. It's about being the prepared seller in the room.
              </p>
            </>
          }
          kpis={[
            { label: 'Rule-of-thumb number', value: '$90M', sub: '5× a wrong EBITDA' },
            { label: 'Real Baseline', value: '$155M', sub: '8.6× × $18M EBITDA' },
            { label: 'What Mark walked away with', value: '+$65M', sub: 'vs. the first quote' },
          ]}
          dark={dark}
        />

        {/* ═══ Slow vs Fast ═══ */}
        <SlowVsFast
          slowLabel="Walking in cold"
          slowItems={[
            { metric: 'Time to first number', value: '6-8 weeks' },
            { metric: 'Source of the number', value: 'Rule of thumb' },
            { metric: 'Comp data', value: 'Anecdotal' },
            { metric: 'Add-back schedule', value: 'Whatever broker says' },
          ]}
          fastLabel="Walking in prepared"
          fastItems={[
            { metric: 'Time to first number', value: '30 seconds' },
            { metric: 'Source of the number', value: 'PitchBook + GF Data' },
            { metric: 'Comp data', value: 'Live, your sector' },
            { metric: 'Add-back schedule', value: 'Yours, in writing' },
          ]}
          takeaway={
            <>
              Brokers run the deal. <strong>You bring the number.</strong> The owners who walk in with their real
              Baseline are the ones who close at the top of the range.
            </>
          }
          dark={dark}
        />

        {/* ═══ Yulia Says ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Yulia says"
            title="Three turns. Your number."
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
                      Specialty industrial distribution. $112M revenue, $16.2M EBITDA on the tax return.
                      Top-5 customers ~31% of revenue. What am I worth?
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
                        Two things to check before I give you a range. (1) Your tax return EBITDA is almost certainly
                        below your real EBITDA — distributors at your size typically have $1-3M of legitimate Blind
                        Equity. (2) 31% top-5 concentration is outside the tight comp tolerance, which knocks you out
                        of the 75th percentile multiple. Want me to walk the P&L for add-backs first?
                      </div>
                    </div>
                  ),
                },
                {
                  type: 'user',
                  content: (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed mt-4">
                      Yes. Pasting last 3 years of P&L now.
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
                        At median multiples for your sector with 31% concentration: <strong>7.2× = $130M.</strong> Fix
                        concentration to 23% over 6 months and you move to the 75th percentile: <strong>8.6× = $155M.</strong>
                        That's your Baseline. Want the add-back schedule to bring to your advisor?
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={<>Find your number.</>}
          sub="Tell Yulia what you do and what it earns. She'll build your Baseline, find your Blind Equity, and hand you the schedule to walk into your next advisor meeting."
          buttonLabel="Find my number"
          onClick={goToChat}
          dark={dark}
        />
      </div>
    </div>
  );
}
