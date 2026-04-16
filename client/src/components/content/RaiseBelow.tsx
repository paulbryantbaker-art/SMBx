import { useState } from 'react';
import { bridgeToYulia } from './chatBridge';
import usePageMeta from '../../hooks/usePageMeta';
import { ConversationTyping } from './animations';
import { StackBuilder, AudiencePicker, type Audience } from './StackBuilder';
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

export default function RaiseBelow({ dark }: { dark: boolean }) {
  const [audience, setAudience] = useState<Audience>('sponsor');

  usePageMeta({
    title: 'Get the capital. Keep the company. · Raise with smbx.ai',
    description:
      'Model every stack: senior, unitranche, mezz, equity, seller rollover. Live cost of capital, DSCR, and founder retention. For owner-operators raising growth capital and sponsors raising for an acquisition.',
    canonical: 'https://smbx.ai/raise',
    ogImage: 'https://smbx.ai/og-raise.png',
    breadcrumbs: [
      { name: 'Home', url: 'https://smbx.ai/' },
      { name: 'Raise capital', url: 'https://smbx.ai/raise' },
    ],
    faqs: [
      {
        question: 'Should I raise debt, equity, or a blend for my growth capital?',
        answer:
          'It depends on your DSCR headroom and your exit horizon. If you can service the debt comfortably (DSCR > 1.4×) and you expect a 5-year exit, debt almost always preserves more upside than equity. If you need flexibility, longer runway, or strategic LP value, equity has a place. Yulia models all the structures side by side against your verified financials.',
      },
      {
        question: 'What is a typical capital stack for an upper middle market acquisition?',
        answer:
          'For a $150-300M EV deal at $15-25M EBITDA in 2024-2025: 40-50% senior debt at SOFR+400-500, 15-25% unitranche or 2nd lien, 10-15% mezzanine, 15-25% sponsor equity, 5-10% seller rollover. Total leverage typically 5.5-6.5× EBITDA. Yulia builds the stack against current market rates and live debt-fund quotes.',
      },
      {
        question: 'How does an independent sponsor raise the equity for a deal?',
        answer:
          'Independent sponsors raise deal-by-deal: identify the target, source the senior debt, negotiate the unitranche/mezz, then pitch LPs on the equity tranche with the full cap stack already modeled. Yulia compresses the cap stack build from weeks to one afternoon and generates the LP pitch deck from the same numbers.',
      },
      {
        question: 'How much can I borrow on my business?',
        answer:
          'Senior leverage in 2024-2025 is typically 3.5-4.5× EBITDA for asset-light services and 4.5-5.5× for asset-heavy distribution and manufacturing. Adding unitranche or 2nd lien can push total leverage to 5.5-6.5× if DSCR clears 1.20× minimum. Personal guarantees apply on SBA 7(a) but not on conventional bank or fund debt at this size.',
      },
      {
        question: 'What is a seller rollover and why include one in the stack?',
        answer:
          'A seller rollover is equity the seller keeps in the deal — typically 5-15% of purchase consideration, sometimes structured as preferred or common. It aligns the seller through transition (they still benefit from upside), softens personal-guarantee asks on the buyer side, and often gets lenders comfortable at slightly higher senior leverage. It can also defer tax on the rolled portion, which sellers like.',
      },
      {
        question: 'How is raising growth capital different from raising for an acquisition?',
        answer:
          'Growth capital means you\u2019re an operating owner funding expansion (new location, product line, working capital headroom) — lenders look at your historical cash flow against pro-forma investment return. Acquisition capital funds a specific target — lenders look at the target\u2019s cash flow, the purchase multiple, and whether your stack services the debt in year 1. Yulia models both, but the inputs and the questions lenders ask are different.',
      },
    ],
  });

  const headingColor = dark ? '#f9f9fc' : '#0f1012';
  const mutedColor = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  // Journey=raise accent (ochre). Inline <em> flourishes + HookHeader eyebrow.
  const accent = dark ? '#DDB25E' : '#C99A3E';

  return (
    <div className="bg-transparent" style={{ color: headingColor }}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ Hook ═══ */}
        <HookHeader
          eyebrow="raise"
          headline={
            <>
              Get the capital. <br />
              <em className="not-italic" style={{ color: accent }}>Keep</em> the company.
            </>
          }
          sub={
            <>
              $1B in dry powder is chasing your deal. Take the slice that doesn't cost you the upside. Yulia models every
              stack — senior, unitranche, mezz, equity, seller rollover — against your real EBITDA and live market rates.
            </>
          }
          dark={dark}
          accent={accent}
        />

        {/* ═══ Audience Picker ═══ */}
        <Reveal className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-4" style={{ color: accent }}>
            Pick your path
          </p>
          <AudiencePicker value={audience} onChange={setAudience} dark={dark} />
        </Reveal>

        {/* ═══ Story (audience-conditional) ═══ */}
        {audience === 'owner' ? (
          <StoryBlock
            byline="James L.*"
            role="Owner — third-party logistics (3PL)"
            dealLine="$92M revenue · $15M EBITDA · Pacific Northwest · 11 yrs"
            body={
              <>
                <p>
                  James needed <strong style={{ color: headingColor }}>$40M of growth capital</strong> for a fleet expansion
                  and a regional acquisition. He had three offers on the table and one nagging question: which one would
                  let him keep the most of his company?
                </p>
                <p className="mt-4">
                  <strong style={{ color: headingColor }}>Offer A — PE growth equity.</strong> $40M for 33% post-money at an
                  $80M pre-money valuation. 1× participating preferred. Standard 5-year exit horizon.
                </p>
                <p className="mt-4">
                  <strong style={{ color: headingColor }}>Offer B — Senior + mezz blend.</strong> $25M senior at SOFR+450,
                  $15M mezz at 12% + 2% PIK. No dilution. Personal guarantee on the senior tranche.
                </p>
                <p className="mt-4">
                  <strong style={{ color: headingColor }}>Offer C — SBA 7(a) + seller note on the acquisition target.</strong>{' '}
                  Smaller raise, slower deployment. Cheapest cost of capital but slowest velocity.
                </p>
                <p className="mt-4">
                  Yulia modeled all three against a 5-year exit at <strong style={{ color: headingColor }}>$250M</strong>{' '}
                  (a conservative 12.5× on a projected $20M EBITDA after the expansion):
                </p>
                <p className="mt-4">
                  <strong style={{ color: accent }}>PE path:</strong> 66.7% ownership × $210M residual after the $40M
                  liquidation preference = <strong style={{ color: accent }}>$140M to James.</strong>
                </p>
                <p className="mt-4">
                  <strong style={{ color: accent }}>Debt-mezz path:</strong> $250M exit minus ~$60M total debt service
                  payoff (principal + cumulative interest) = <strong style={{ color: accent }}>$190M to James.</strong>
                </p>
                <p className="mt-4">
                  Delta: <strong style={{ color: accent }}>$50M.</strong> James took the debt-mezz blend. He still owns 100%
                  of the company. He'll likely refinance into a cheaper facility in year 2 once EBITDA settles.
                </p>
                <p className="mt-4 text-base italic" style={{ color: mutedColor }}>
                  Both paths fund the deal. Only one keeps the company.
                </p>
              </>
            }
            kpis={[
              { label: 'PE path · 5-yr exit', value: '$140M', sub: '66.7% × $210M residual' },
              { label: 'Debt-mezz path', value: '$190M', sub: 'after ~$60M debt payoff' },
              { label: 'Capital preserved', value: '+$50M', sub: 'and James still owns 100%' },
            ]}
            dark={dark}
            accent={accent}
          />
        ) : (
          <StoryBlock
            byline="Ed K.*"
            role="Independent sponsor — fundless"
            dealLine="$180M acquisition · $20M EBITDA · specialty chemicals distribution"
            body={
              <>
                <p>
                  Ed had <strong style={{ color: headingColor }}>$25M of committed LP capital</strong>, a target under LOI,
                  and the part of the deal every fundless sponsor dreads: the cap stack.
                </p>
                <p className="mt-4">
                  $180M enterprise value. $20M EBITDA. Specialty chemicals distribution — asset-heavy, recurring contracts,
                  the kind of business banks and credit funds love.
                </p>
                <p className="mt-4">
                  Yulia built the full stack in <strong style={{ color: accent }}>one afternoon</strong>:
                </p>
                <p className="mt-4">
                  <strong style={{ color: headingColor }}>$80M senior</strong> at SOFR+450 (4× senior leverage on EBITDA — bank-acceptable for distribution).{' '}
                  <strong style={{ color: headingColor }}>$40M unitranche</strong> at 10% (pushes total to 6× — aggressive but doable in current market).{' '}
                  <strong style={{ color: headingColor }}>$25M mezz</strong> at 13% cash + 3% PIK + 5% warrants.{' '}
                  <strong style={{ color: headingColor }}>$25M sponsor equity</strong> (his $25M LP commitment, fully deployed).{' '}
                  <strong style={{ color: headingColor }}>$10M seller rollover</strong> (ongoing 5.5% stake — keeps the founder
                  motivated through transition).
                </p>
                <p className="mt-4">
                  Year-1 cash debt service: $14.85M. EBITDA: $20M. Year-1 DSCR:{' '}
                  <strong style={{ color: accent }}>1.35×</strong> — clears the senior covenant minimum of 1.20× with cushion.
                </p>
                <p className="mt-4">
                  Yulia modeled three alternative stacks (more equity / less mezz, all-senior at lower leverage, ESOP-light
                  for tax purposes). She also surfaced two mezz funds from Ed's existing LP base who'd already committed to
                  similar deals. Closed in <strong style={{ color: accent }}>4.5 months</strong> — vs. the 9-11 months that
                  most independent sponsors quote for first deals at this size.
                </p>
                <p className="mt-4 text-base italic" style={{ color: mutedColor }}>
                  Cap stack is the part where deals die. Yulia builds it in an afternoon.
                </p>
              </>
            }
            kpis={[
              { label: 'Total cap stack built', value: '$180M', sub: '5 layers, modeled in 1 afternoon' },
              { label: 'Year-1 DSCR', value: '1.35×', sub: 'comfortable above 1.20× minimum' },
              { label: 'Time to close', value: '4.5 mo', sub: 'vs. 9-11 mo industry average' },
            ]}
            dark={dark}
            accent={accent}
          />
        )}

        {/* ═══ Stack Builder ═══ */}
        {/* ═══ Stack Builder — cinematic anchor (full-bleed immersive band) ═══ */}
        <SectionBand tone="immersive" dark={dark}>
          <SectionHeader
            label="Step 1 · The Stack"
            title="Drag the layers. Watch the math."
            sub={
              audience === 'owner'
                ? 'Five layers of capital. Move any slider, the others rebalance. The read-out shows your blended cost of capital, year-1 DSCR, and how much of the company you keep.'
                : 'Five layers of capital. Move any slider, the others rebalance. The read-out shows your blended cost of capital, year-1 DSCR, and your sponsor equity check.'
            }
            dark={dark}
            accent={accent}
          />
          <StackBuilder dark={dark} audience={audience} ev={180} ebitda={20} />
        </SectionBand>

        {/* ═══ Slow vs Fast ═══ */}
        <SlowVsFast
          slowLabel="Conventional raise"
          slowItems={[
            { metric: 'Time to model the stack', value: '5-9 weeks' },
            { metric: 'Lender meetings before terms', value: '8-15' },
            { metric: 'Stacks compared side by side', value: '1-2' },
            { metric: 'Time to close (sponsor first deal)', value: '9-11 months' },
          ]}
          fastLabel="With Yulia"
          fastItems={[
            { metric: 'Time to model the stack', value: '1 afternoon' },
            { metric: 'Lender meetings before terms', value: '3-5' },
            { metric: 'Stacks compared side by side', value: '7+' },
            { metric: 'Time to close (sponsor first deal)', value: '4-5 months' },
          ]}
          takeaway={
            <>
              Cap stacks die in the modeling phase, not the closing phase. Yulia compresses the modeling from weeks
              to hours. <strong>The deal you'd have walked away from is the deal you close.</strong>
            </>
          }
          dark={dark}
          accent={accent}
        />

        {/* ═══ Yulia Says ═══ */}
        <Reveal className="mb-28">
          <SectionHeader
            label="Yulia says"
            title="From 'I need capital' to a modeled stack."
            dark={dark}
            accent={accent}
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
                      Closing on a $180M specialty chemicals distributor. $20M EBITDA. Have $25M LP equity committed.
                      Need to fill the rest. Where do I start?
                    </div>
                  ),
                },
                {
                  type: 'ai',
                  content: (
                    <div className="flex gap-3 items-start mt-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: accent }}>
                        Y
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed">
                        Asset-heavy distribution → senior debt is your friend. At 4× leverage you can borrow $80M cheap.
                        Add a $40M unitranche to push total leverage to 6× (still defensible for chemicals distribution).
                        That leaves $35M to fill — your $25M equity plus $10M of seller rollover. Want me to add a $25M
                        mezz tranche and reduce your equity check, or hold it tight?
                      </div>
                    </div>
                  ),
                },
                {
                  type: 'user',
                  content: (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed mt-4">
                      Add the mezz. Show me DSCR at both versions.
                    </div>
                  ),
                },
                {
                  type: 'ai',
                  content: (
                    <div className="flex gap-3 items-start mt-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: accent }}>
                        Y
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed">
                        Without mezz: $14M cash debt service → DSCR <span className="text-[#8ff9a8] font-bold">1.43×</span>.
                        With $25M mezz at 13% + 3% PIK: $14.85M cash → DSCR <span className="text-[#8ff9a8] font-bold">1.35×</span>.
                        Both clear the 1.20× covenant. The mezz cuts your equity check from $35M to $25M but adds $750K
                        of annual PIK accrual against the senior covenant. <strong>Recommendation: take the mezz, but
                        negotiate a 1.15× DSCR step-down in year 2.</strong>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Reveal>

        {/* ═══ Sign-off chain ═══ */}
        <SectionBand tone="alt" dark={dark}>
          <SignOffChain
            intro={
              <>
                Ed didn't just model the cap stack. He closed it. Yulia drafted the LP pitch deck from
                the modeled stack, routed it to his deal counsel for redlines, sent the structure deck
                to the senior bank and the mezz fund in parallel, tracked every term-sheet response,
                and logged every version. When the LPs asked for the deal narrative six months later,
                the chain of custody was already in place.
              </>
            }
            steps={[
              {
                label: 'Draft',
                yulia: 'Yulia drafts the LP pitch deck + structure memo',
                chain: 'From the modeled stack. Senior, unitranche, mezz, equity, rollover all itemized.',
              },
              {
                label: 'Route',
                yulia: 'Routes the structure memo to deal counsel',
                chain: 'request_review with focus_areas: "Verify the mezz warrant terms and the seller rollover mechanics."',
              },
              {
                label: 'Wait',
                yulia: "Holds the LP deck in 'review' until counsel signs off",
                chain: 'Counsel comments inline. State machine advances on approval.',
              },
              {
                label: 'Execute',
                yulia: 'Sends structure deck to senior bank + mezz fund in parallel',
                chain: 'share_document with watermark + view tracking. Yulia logs every term-sheet response.',
              },
              {
                label: 'Log',
                yulia: 'Chain of custody on every term-sheet revision',
                chain: 'When LPs ask "show me the deal narrative" six months in, the answer is in the database.',
              },
            ]}
            bottomNote={
              <>
                Cap stacks die in the modeling phase. Yulia compresses modeling into one afternoon — and then runs the chain that keeps the deal moving until close.
              </>
            }
            dark={dark}
            accent={accent}
          />
        </SectionBand>

        {/* ═══ CTA ═══ */}
        <PageCTA
          headline={audience === 'owner' ? <>Protect your equity.</> : <>Complete your stack.</>}
          sub={audience === 'owner'
            ? "Tell Yulia what you're financing and how much you need. She'll model senior debt, mezz, and seller note side-by-side against PE equity — so you can see exactly what each option costs in founder ownership. Your attorney, CPA, and lender counsel run free when they join the deal."
            : "Tell Yulia the deal, the LP commitments, and the gap. She'll build the five-layer stack, model DSCR at proposed leverage, and draft the LP pitch from the same numbers — in one conversation. Your deal counsel and CPA run free when they join the workflow."
          }
          buttonLabel={audience === 'owner' ? 'Model my options' : 'Build my stack'}
          onClick={() => bridgeToYulia(
            audience === 'owner'
              ? "I own a business with about $XM revenue / $XM EBITDA in [industry]. I need to raise $XM for [growth / refi / acquisition]. Model senior debt, mezz, and seller note against PE equity so I can see what each option costs me in ownership."
              : "I'm a sponsor closing on a $XM acquisition at $XM EBITDA. I have $XM of LP equity committed. Help me build the five-layer cap stack — senior, unitranche, mezz, sponsor equity, seller rollover — against current market rates and model year-1 DSCR."
          )}
          dark={dark}
          accent={accent}
        />
      </div>
    </div>
  );
}
