import { bridgeToYulia } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { ConversationTyping } from './animations';
import { LandingSBACalc } from './LandingCalculators';
import { LiveRundown } from './LiveRundown';
import {
  HookHeader,
  StoryBlock,
  BrandedTermCard,
  SlowVsFast,
  SectionHeader,
  SignOffChain,
  PageCTA,
  SectionBand,
} from './storyBlocks';

export default function BuyBelow({ dark }: { dark: boolean }) {
  usePageMeta({
    title: 'Kill 100 bad deals before lunch · Buy with smbx.ai',
    description:
      'Score every deal in 8 seconds. Kill the losers, find the one that pays. The Rundown™ runs 7 dimensions on any deal — for SBA buyers to $1B funds. AI deal intelligence for acquirers.',
    canonical: 'https://smbx.ai/buy',
    ogImage: 'https://smbx.ai/og-buy.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Buy a business', url: 'https://smbx.ai/buy' },
    ],
    faqs: [
      {
        question: 'How do I screen acquisition targets fast?',
        answer:
          'The Rundown™ scores any deal across seven dimensions in 8 seconds: financial performance, market position, owner dependency, customer concentration, growth trajectory, bankability (DSCR), and operational risk. Each dimension gets 0-100, with a one-line justification. The composite gives you a pursue / negotiate / kill verdict before you spend an hour reading the CIM.',
      },
      {
        question: 'What size deals does smbx.ai support?',
        answer:
          'From $1M SBA acquisitions to $500M+ private equity buyouts. Yulia adapts the analysis depth and the cap stack model to the deal size. For SBA deals, that means 7(a) eligibility, DSCR at 1.25× minimum, and personal guarantee math. For PE deals, that means full pro forma, sources & uses, exit waterfall, and IRR sensitivity.',
      },
      {
        question: 'Can Yulia model the capital stack for a deal?',
        answer:
          'Yes. Senior debt, unitranche, mezzanine, sponsor equity, seller rollover, earnouts. Yulia builds the stack against current 2024-2025 market rates, computes year-1 DSCR, and models founder retention or sponsor MOIC at exit. You see the full math before you sign.',
      },
      {
        question: 'How does The Rundown compare to a traditional CIM screen?',
        answer:
          'A traditional CIM screen takes 4-6 hours of analyst time: read, model, draft an IC memo. The Rundown takes 8 seconds. Same dimensions, same logic, different velocity. You move from screening 5 deals a week to screening 100 a morning — and you spend the saved time on the 1-in-100 deal that actually pays.',
      },
      {
        question: 'How accurate is the 8-second verdict compared to full diligence?',
        answer:
          'The Rundown is a screen, not a diligence report. It reliably identifies the 60-70% of deals that shouldn\u2019t make it past first read — customer concentration above 35%, DSCR below 1.1×, owner wages hiding real EBITDA, single-vendor dependency. For the deals it scores "pursue," you still run full diligence. The value is filtering, not final judgment: you stop burning hours on deals the math says don\u2019t work.',
      },
      {
        question: 'What data does Yulia need to run The Rundown?',
        answer:
          'Minimum: industry, revenue, EBITDA or SDE, and ask price. Ideal: customer concentration, growth rate over the last 3 years, owner wages, whether the business is recurring or project-based, and any debt already in place. Missing data gets flagged — Yulia scores what\u2019s there and tells you which dimension is unknown, so you know what to ask for next.',
      },
    ],
  });

  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  // Journey=buy accent (teal). Inline <em> flourishes + HookHeader eyebrow.
  const accent = dark ? '#52A8A8' : '#3E8E8E';

  return (
    <div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="buy"
          headline={
            <>
              Kill <em className="not-italic" style={{ color: accent }}>100</em> bad deals before lunch.
            </>
          }
          sub={
            <>
              $1B in dry powder doesn't matter if you can't find the one that pays. The Rundown™ scores any deal in 8 seconds —
              from a $1M SBA listing to a $500M sponsor target. The 99 you kill take seconds. The one that survives is yours to close.
            </>
          }
          dark={dark}
          accent={accent}
        />

        {/* ═══ Yulia Says — leads ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Step 1 · Yulia screens"
            title="Show her a deal. Get the verdict."
            sub="Paste a listing URL, drop in a CIM excerpt, or describe the business in one line. Yulia runs The Rundown™ — seven dimensions, real comps, real bank rates."
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
                      Cybersecurity SaaS in Boston. $88M ARR, $24M EBITDA, asking 18×. NRR 132%, top-10 customers
                      16%, 32% YoY growth, 9 years operating. Should I dig in?
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
                        Cybersecurity SaaS at $24M EBITDA — let me run The Rundown.{' '}
                        <span className="text-[#ffb2bf] font-bold">Composite score 83/100 — PURSUE.</span>{' '}
                        Headline: Rule of 40 = 64 (top decile), NRR 132% (best in class), 16% top-10 (fully diversified),
                        32% YoY (double the cohort median). Headline weakness: bankability is asset-light.
                      </div>
                    </div>
                  ),
                },
                {
                  type: 'user',
                  content: (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed mt-4">
                      What does the cap stack look like at 18×?
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
                        $432M EV at 18× × $24M. Asset-light caps senior at ~1.8× → <strong>$43M senior</strong> @ SOFR+475.{' '}
                        <strong>$40M unitranche second lien</strong> @ 10.5% (additional 1.7× leverage). That leaves{' '}
                        <strong>$349M of sponsor equity + seller rollover.</strong> Year-1 DSCR clears at{' '}
                        <span className="text-[#8ff9a8] font-bold">1.85×</span> — comfortable cushion.
                        Real question is whether your fund has the equity check size. Want me to model 3 scenarios?
                      </div>
                    </div>
                  ),
                },
              ]}
            />
            <p className="text-[#dadadc]/50 text-xs text-center mt-6">
              No signup. No demo data. Yulia is running real comps.
            </p>
          </div>
        </section>

        {/* ═══ The Story ═══ */}
        <StoryBlock
          byline="Priya S.*"
          role="Principal, $2.5B mid-market PE fund"
          dealLine="Coverage: vertical SaaS · cybersecurity · healthcare services · $25-100M EBITDA · $200M avg equity check"
          body={
            <>
              <p>
                Priya's fund had $2.5B of committed capital, a sharp thesis on vertical SaaS and tech-enabled
                services, and a single bottleneck: <strong style={{ color: headingColor }}>inbound CIM volume.</strong>
              </p>
              <p className="mt-4">
                Sell-side advisors were sending her <strong style={{ color: accent }}>40-60 CIMs a week</strong>.
                Reading and modeling each one took 4-6 hours of analyst time. At capacity, her team could screen
                12 a week — out of 50. The other 38 sat in a folder.
              </p>
              <p className="mt-4">
                Industry conversion from screen to live diligence is about 3%. From 624 screens a year, that's{' '}
                <strong style={{ color: headingColor }}>roughly 19 live deals</strong>. From 19 live deals, the fund
                closed maybe 2 — at $200M average EV, that's $400M deployed per principal per year.
              </p>
              <p className="mt-4">
                Yulia changed the math at the top of the funnel. The Rundown™ runs all seven dimensions in 8 seconds —
                composite score, verdict, and a one-line justification per dimension. Priya now screens{' '}
                <strong style={{ color: accent }}>300 CIMs a week</strong>. The folder is empty by Tuesday.
              </p>
              <p className="mt-4">
                She's also more selective. Effective conversion from screen to live drops to 1% — but on 15,600 annual
                screens, that's <strong style={{ color: accent }}>156 live deals</strong>. Same 10% close rate. About{' '}
                <strong style={{ color: accent }}>16 closes a year per principal</strong>, vs. 2 before. At $200M average EV, that's{' '}
                <strong style={{ color: accent }}>$3.2B of deal flow per principal per year.</strong> Same fund, same thesis, eight times the throughput.
              </p>
              <p className="mt-4 text-base italic" style={{ color: mutedColor }}>
                The unlock isn't "buy faster." It's "kill faster, so you can find the one that pays."
              </p>
            </>
          }
          kpis={[
            { label: 'Pre-Yulia · annual deployed', value: '~$400M', sub: '12 CIMs/wk × 3% × 10% × $200M avg' },
            { label: 'Post-Yulia · annual deployed', value: '~$3.2B', sub: '300 CIMs/wk × 1% × 10% × $200M avg' },
            { label: 'Throughput multiplier', value: '8×', sub: 'same principal, same fund, no headcount' },
          ]}
          dark={dark}
        />

        {/* ═══ The Rundown product ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="The Rundown™"
            title="Seven dimensions. Eight seconds. One verdict."
            sub="The same screen PE associates run, compressed into a single conversation. Pursue, negotiate, or kill — before you spend an hour on the CIM."
            dark={dark}
          />
          <BrandedTermCard
            term="The Rundown"
            oneLiner="Score any deal in 8 seconds. Pursue, negotiate, or kill."
            definition="Seven dimensions: financial performance, market position, owner dependency, customer concentration, growth trajectory, bankability (DSCR at proposed structure), and operational risk. Each dimension gets 0-100 with a one-line justification. The composite picks the verdict."
            example="A $24M EBITDA cybersecurity SaaS at 18× ask, NRR 132%, 32% YoY: composite 83/100 → PURSUE. A $58M EBITDA defense manufacturer at 9.5× ask, 71% DoD concentration, 11% CAGR: composite 71/100 → NEGOTIATE."
            onCTA={() =>
              bridgeToYulia(
                "Run The Rundown on a deal I'm evaluating. It's a [industry] business at roughly $XM revenue / $XM EBITDA, asking around $XM. Score it across the seven dimensions and tell me pursue, negotiate, or kill."
              )
            }
            ctaLabel="Run The Rundown on a deal"
            dark={dark}
          />
        </section>

        {/* ═══ Live Rundown — cinematic anchor (full-bleed immersive band) ═══ */}
        <SectionBand tone="immersive" dark={dark}>
          <SectionHeader
            label="Try it live"
            title="Pick a deal. Watch The Rundown run."
            sub="Three real deal preview cases. Hit run — the seven dimensions reveal one at a time, then the verdict lands."
            dark={dark}
          />
          <LiveRundown dark={dark} />
        </SectionBand>

        {/* ═══ Slow vs Fast ═══ */}
        <SlowVsFast
          slowLabel="The old velocity"
          slowItems={[
            { metric: 'Deals screened / week', value: '5-12' },
            { metric: 'Time per CIM screen', value: '4-6 hrs' },
            { metric: 'Live deals / yr', value: '~19' },
            { metric: 'Closes / yr / analyst', value: '~2' },
          ]}
          fastLabel="The new velocity"
          fastItems={[
            { metric: 'Deals screened / week', value: '300+' },
            { metric: 'Time per CIM screen', value: '8 seconds' },
            { metric: 'Live deals / yr', value: '~156' },
            { metric: 'Closes / yr / analyst', value: '~16' },
          ]}
          takeaway={
            <>
              The bottleneck was never "find more deals" — it was "kill bad deals faster." Yulia kills the 99 in
              eight seconds each. <strong>You spend the saved time on the one that pays.</strong>
            </>
          }
          dark={dark}
        />

        {/* ═══ SBA / Cap stack ═══ */}
        <section className="mb-28">
          <SectionHeader
            label="Step 2 · Model the stack"
            title="Can the deal carry its own debt?"
            sub="The Rundown gives you the verdict. The cap stack tells you whether the verdict is fundable. Run year-1 DSCR against your proposed structure, see whether you clear covenants with cushion or just barely."
            dark={dark}
          />
          <LandingSBACalc dark={dark} />
        </section>

        {/* ═══ Sign-off chain ═══ */}
        <SectionBand tone="alt" dark={dark}>
          <SignOffChain
            intro={
              <>
                Priya doesn't just screen deals. She closes them. Yulia builds the IC memo from the
                CIM, routes it to the deal team for review, holds it in queue until the partner signs off,
                models the cap stack against current lender quotes, transmits the LOI to the seller's
                broker, and logs every version of every document. Year-2 refi conversations start with
                a clean audit trail.
              </>
            }
            steps={[
              {
                label: 'Draft',
                yulia: 'Yulia drafts the IC memo + LOI',
                chain: 'From the CIM excerpt + your thesis. The Rundown score baked in.',
              },
              {
                label: 'Route',
                yulia: 'Routes IC memo to your partners',
                chain: 'request_review with focus_areas: "Verify the comp set and DSCR assumption."',
              },
              {
                label: 'Wait',
                yulia: "Holds LOI in 'review' until partner sign-off + your attorney redlines",
                chain: 'Two-stage review chain: deal team approval → counsel approval → owner final.',
              },
              {
                label: 'Execute',
                yulia: "Sends LOI to the seller's broker",
                chain: 'share_document with the brokered terms. Every view tracked.',
              },
              {
                label: 'Log',
                yulia: 'Chain of custody on every number',
                chain: "Year-2 refi conversation starts with the lender asking for the audit trail. It's there.",
              },
            ]}
            bottomNote={
              <>
                The 99 deals you killed take seconds. The 1 you closed takes a chain of custody that survives the buyer's lawyer, the senior bank's covenant review, and the year-2 refi.
              </>
            }
            dark={dark}
          />
        </SectionBand>

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={<>Run The Rundown on a deal.</>}
          sub="Bring Yulia a listing URL, a CIM excerpt, or a one-line description — from a $1M SBA target to a $500M sponsor deal. She returns a verdict in eight seconds and a cap-stack model in two minutes. Your attorney, CPA, and appraiser run free when they join the deal — they're on your deal, not their own book."
          buttonLabel="Run The Rundown"
          onClick={() =>
            bridgeToYulia(
              "Run The Rundown on a deal I'm evaluating. It's a [industry] business at roughly $XM revenue / $XM EBITDA, asking around $XM. Score it across the seven dimensions and tell me pursue, negotiate, or kill."
            )
          }
          dark={dark}
        />
      </div>
    </div>
  );
}
