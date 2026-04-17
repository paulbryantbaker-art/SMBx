/**
 * Glass Grok · /sell (desktop rebuild)
 * ─────────────────────────────────────────────────────────────────────
 * Reference desktop journey page. Hero 2-col with AddBackSchedule
 * peek on the right. Zigzag capability heroes (text + mockup, then
 * mockup + text, then text + mockup). Alternating app/tint/dark
 * section rhythm. Horizontal 4-phase timeline. Dark stat bar.
 * 6-card exit-paths grid. Dark bottom CTA.
 *
 * Spec source: Glass Grok/SMBX_SITE_COPY.md (page 2)
 *              Glass Grok desktop spec (2-col heroes, horizontal timeline)
 */

import { useMemo, useState } from 'react';
import {
  Page, JourneyHero, Section, H2, Body,
  StatBar, Card, BottomCta,
  HorizontalTimeline, SectionNav,
  type JourneyTab,
} from '../primitives';
import { AddBackSchedule, CIMCover, IOIGrid } from '../mockups';

interface Props {
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate?: (dest: JourneyTab) => void;
}

const CHIPS = [
  'What’s my business worth?',
  'Find my hidden add-backs',
  'Draft my CIM',
  'Am I ready to sell?',
] as const;

const HERO_LINES = [
  { title: 'Owner compensation above market', subtitle: '$165K paid · $143K benchmark', amount: '+$22,000' },
  { title: 'Personal vehicles',                 subtitle: '2 F-150s · fuel, maintenance, insurance', amount: '+$14,000' },
  { title: 'Spouse on payroll',                 subtitle: 'Replaceable at market rate',  amount: '+$11,000' },
];
const QOFE_LINES = [
  { title: 'Above-market rent to own LLC', subtitle: '$84K/yr → $56K market · normalize', amount: '+$28,000' },
  { title: 'One-time legal (acquisition)',  subtitle: 'Non-recurring · 2024 only',            amount: '+$41,000' },
  { title: 'Discretionary consulting',      subtitle: 'Industry research · closable',         amount: '+$19,000' },
  { title: 'Personal expenses on books',    subtitle: 'Auto, phone, meals',                        amount: '+$38,000' },
];
const IOI_CELLS = [
  { name: 'Family office',   price: '$2.4M', note: '100% cash · 60 days' },
  { name: 'Strategic · top', price: '$2.9M', note: '85% cash · 15% rollover', winner: true },
  { name: 'PE roll-up',      price: '$2.7M', note: '$400K earnout' },
];

const EXIT_PATHS: { title: string; body: string; journey?: JourneyTab; cta?: string }[] = [
  { title: 'Full Sale',                   body: 'Sell 100%. Maximum immediate liquidity. Clean break. Best for owners ready to exit entirely.' },
  { title: 'Majority Sale with Rollover', body: 'Sell 51–80% to PE or strategic. Cash today. Keep equity for a second bite in 3–5 years.',       journey: 'raise', cta: 'Explore raising capital' },
  { title: 'Minority Equity Raise',       body: 'Sell 20–40% to a growth investor. Access capital without giving up control. Stay in the operator seat.', journey: 'raise', cta: 'Explore minority raises' },
  { title: 'ESOP',                        body: 'Sell to your employees. Significant tax advantages via Section 1042. Stay as chairman. Culture preserved.' },
  { title: 'Recapitalization',            body: 'Dividend recap with debt. Take $15M–$40M in cash. Retain 100% equity. Keep growing.',           journey: 'raise', cta: 'Model a recap' },
  { title: 'Partial Asset Sale',          body: 'Sell a division, license IP, sell-leaseback real estate. Unlock value without a full exit.',    journey: 'raise', cta: 'Explore partial monetization' },
];

const SECNAV = [
  { id: 'the-problem',                label: 'Problem' },
  { id: 'hero-1-add-backs',           label: 'Add-backs' },
  { id: 'hero-2-cim',                 label: 'CIM' },
  { id: 'hero-3-competitive-process', label: 'Competitive' },
  { id: 'estimator',                  label: 'Estimator' },
  { id: 'the-process',                label: 'Process' },
  { id: 'by-the-numbers',             label: 'Numbers' },
  { id: 'exit-paths',                 label: 'Exit paths' },
];

export default function Sell({ onSend, onStartFree, onNavigate }: Props) {
  return (
    <Page active="sell" onNavigate={onNavigate} onStartFree={onStartFree}>
      <SectionNav items={SECNAV} />
      {/* ═════ Hero — JourneyHero with AddBackSchedule peek ═════ */}
      <JourneyHero
        eyebrow="Selling your business"
        headline="Know what you have. Before anyone else does."
        tagline="Yulia finds the value hiding in your financials, builds the documents that sell your business, and manages the process that gets you to the closing table. From first conversation to wire transfer."
        chatPlaceholder="Tell Yulia about your business — industry, revenue…"
        chips={CHIPS}
        onSend={onSend}
        onChip={onSend}
        rightPanel={
          <AddBackSchedule
            label="Live preview · Acme HVAC"
            heading="Add-back schedule"
            lines={HERO_LINES}
            totalLabel="Blind Equity™"
            totalNote="Adds ~0.35× to multiple on upper band"
            totalAmount="+$47K"
          />
        }
      />

      {/* ═════ Problem — two-column body on tint ═════ */}
      <Section variant="tint" label="The problem">
        <H2>75% of owners who sell their business regret it within a year.</H2>
        <div className="gg-two-col" style={{ marginTop: 48, alignItems: 'start' }}>
          <div>
            <Body>The number comes from the Exit Planning Institute. Thousands of former owners surveyed. The regrets are almost always the same.</Body>
            <Body>They weren’t financially prepared. They left hundreds of thousands &mdash; sometimes millions &mdash; on the table. In add-backs they never identified. In tax structures they never modeled. In competitive processes they never ran. They accepted the first offer because they had no way to know if it was fair.</Body>
            <Body><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 600 }}>Most of this was preventable.</strong></Body>
          </div>
          <div>
            <Body>The owners who sell well share one thing: they knew their numbers before anyone else did. They found the value hiding in their own financials. They prepared the business to look through a buyer’s lens. They ran a process that created competition.</Body>
            <Body>Yulia does all of that. Starting in a conversation.</Body>
          </div>
        </div>
      </Section>

      {/* ═════ Hero 1 · Add-backs — 55/45 text-first, mockup escapes right ═════ */}
      <Section label="Hero 1 · Add-backs">
        <div className="gg-two-col gg-two-col--55-45" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">The money hiding in your tax returns.</H2>
            <Body lead>Reported EBITDA and real EBITDA are almost never the same number.</Body>
            <Body>Your accountant’s job is to minimize your taxes. A buyer’s job is to maximize the price they’ll justify to their lender or investment committee. Somewhere between those two numbers is the truth — and the gap is almost always larger than you think.</Body>
            <span className="gg-bigstat">$1.1M</span>
            <span className="gg-bigstat__cap">Average hidden value · per analysis</span>
            <Body>At a 5–6&times; multiple, that’s <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>$5.5M–$6.6M</strong> in enterprise value sitting in the financials. A formal QofE costs $25K–$75K and takes 3–6 weeks. Yulia’s pre-LOI analysis takes 20 minutes.</Body>
          </div>
          <div>
            <div className="gg-card--escape-right">
              <AddBackSchedule
                label="Your analysis · live"
                heading="What the QofE will find"
                lines={QOFE_LINES}
                totalLabel="Total add-backs · pre-QofE"
                totalNote="At 5.5× · $693K in enterprise value"
                totalAmount="+$126K"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ═════ Hero 2 · CIM — 40/60 mockup dominant, reversed ═════ */}
      <Section variant="tint" label="Hero 2 · CIM">
        <div className="gg-two-col gg-two-col--40-60 gg-two-col--reverse" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">Your business deserves better than a data dump.</H2>
            <Body>A Confidential Information Memorandum is the single most important document in a sell-side process. It’s what qualified buyers read to decide whether your business is worth their time.</Body>
            <Body>Most CIMs are data dumps. Revenue tables. Margin charts. An &ldquo;overview&rdquo; section that reads like it was written by someone who’s never visited the business.</Body>
            <Body>Yulia’s CIM is a strategic narrative. 25–40 pages. Your business positioned not as a business to buy, but as a <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>platform to scale</strong>.</Body>
            <Body>The same company, described two ways, can trade at 4.5&times; or 7&times;. The difference is almost never the business. It’s the CIM.</Body>
          </div>
          <div>
            <CIMCover />
          </div>
        </div>
      </Section>

      {/* ═════ Hero 3 · Competitive process — 60/40 text dominant ═════ */}
      <Section label="Hero 3 · Competitive process">
        <div className="gg-two-col gg-two-col--60-40" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">
              <span style={{ display: 'block' }}>One buyer gives you a price.</span>
              <span style={{ display: 'block' }}>Five buyers give you a market.</span>
            </H2>
            <Body>The competitive process is the single highest-ROI activity in any exit. Most sellers skip it — because it’s logistically complex, because their broker doesn’t have the bandwidth, because they don’t know it’s an option.</Body>
            <Body>Yulia manages the entire process. Buyer identification — strategic, PE, and independent — mapped and scored. Outreach sequencing. IOI comparison matrix that shows not just the headline price, but the terms.</Body>
            <Body>The winning bid in a competitive process is typically <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>15–30% above the initial offer</strong>. On a $50M transaction, that’s $7.5M–$15M more.</Body>
          </div>
          <div>
            <IOIGrid
              cells={IOI_CELLS}
              footnote={<><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>Yulia’s take:</strong> Strategic wins on headline and certainty. After-tax, all three within $180K of each other.</>}
            />
          </div>
        </div>
      </Section>

      {/* ═════ Interactive — Add-back estimator ═════ */}
      <Section variant="tint" label="Estimator">
        <AddBackEstimator onSend={onSend} />
      </Section>

      {/* ═════ 4-phase timeline ═════ */}
      <Section label="The process">
        <H2>How your exit actually works.</H2>
        <p className="gg-body--sub" style={{ marginBottom: 48 }}>Six months to two years. One guided workflow.</p>
        <HorizontalTimeline phases={[
          { idx: 'Phase 1 · Free', name: 'Understand', meta: 'Months 1–2',
            body: 'See your business through a buyer’s lens. Financials normalized. Add-backs found. Value range against your market.',
            deliverables: 'Preliminary value range · Add-back analysis · Readiness score · Market positioning' },
          { idx: 'Phase 2', name: 'Optimize', meta: 'Months 3–12',
            body: '$50K improvement in EBITDA at 5× = $250K more at closing. Optimization roadmap with dollar impact on every action item.',
            deliverables: 'Improvement plan · Dollar impact per action · Progress tracking · Milestone projections' },
          { idx: 'Phase 3', name: 'Prepare', meta: 'Months 6–18',
            body: 'CIM. Financial exhibits. Buyer targeting. Deal room. Everything a qualified buyer needs to make a decision.',
            deliverables: 'CIM · Blind teaser · Buyer universe · Deal room · Outreach strategy' },
          { idx: 'Phase 4', name: 'Close', meta: 'Months 12–24',
            body: 'LOI evaluation. Structure modeling. Earnout analysis. Competitive process management. Closing coordination.',
            deliverables: 'IOI/LOI comparison · Deal structure · DD coordination · Working capital · Closing' },
        ]} />
      </Section>

      {/* ═════ Dark stat bar ═════ */}
      <Section variant="dark" label="By the numbers">
        <StatBar items={[
          { value: '$1.1M',  label: 'Average hidden value found per analysis' },
          { value: '30 min', label: 'Average time to first deliverable' },
          { value: '4–7×', label: 'Typical preparation premium on enterprise value' },
        ]} />
      </Section>

      {/* ═════ Exit paths — 2-up featured / 4-across alternatives ═════
           Breaks the 6-card monotony: the two most common paths (Full Sale
           + Majority Rollover) get 50% width each on top row with a "most
           common" pill; the four alternatives share the second row. */}
      <Section label="Exit paths">
        <H2>Selling 100% isn’t your only option.</H2>
        <p className="gg-body--sub" style={{ marginBottom: 40 }}>Yulia models every exit structure against your specific numbers. In one conversation.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          {EXIT_PATHS.map((p, i) => {
            const featured = i < 2;
            const clickable = !!p.journey && !!onNavigate;
            const handleClick = clickable ? () => onNavigate!(p.journey!) : undefined;
            return (
              <Card
                key={p.title}
                padding={featured ? 32 : 22}
                onClick={handleClick}
                style={{
                  gridColumn: featured ? 'span 2' : 'span 1',
                  borderColor: featured ? 'var(--gg-text-primary)' : undefined,
                  cursor: clickable ? 'pointer' : 'default',
                }}
              >
                {featured && (
                  <div className="gg-label" style={{ marginBottom: 10, fontSize: 10 }}>Most common</div>
                )}
                <h4 style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: featured ? 19 : 15, letterSpacing: '-0.01em', marginBottom: 10, color: 'var(--gg-text-primary)' }}>{p.title}</h4>
                <p className="gg-body" style={{ marginBottom: clickable ? 14 : 0, fontSize: featured ? 14 : 13, lineHeight: 1.55 }}>{p.body}</p>
                {clickable && (
                  <span style={{
                    fontFamily: 'var(--gg-display)',
                    fontWeight: 700,
                    fontSize: featured ? 12 : 11,
                    letterSpacing: '-0.005em',
                    color: 'var(--gg-text-primary)',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    {p.cta}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                )}
              </Card>
            );
          })}
        </div>
        <div style={{
          marginTop: 24,
          padding: '18px 20px',
          background: 'var(--gg-bg-subtle)',
          borderRadius: 12,
          fontSize: 13.5,
          color: 'var(--gg-text-secondary)',
          lineHeight: 1.55,
          maxWidth: 1000,
        }}>
          Yulia shows you every path with after-tax proceeds, retained ownership, ongoing cash flow, and control implications. Side by side. Same financials. Different outcomes.
        </div>
      </Section>

      {/* ═════ Bottom CTA — dark ═════ */}
      <BottomCta
        heading="Tell Yulia about your business."
        subhead="The first conversation is free. The first deliverable is free. Start when you’re ready."
        chatPlaceholder="Industry, revenue, what you’re thinking…"
        onSend={onSend}
      />
    </Page>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   ADD-BACK ESTIMATOR — interactive (unchanged math, restyled shell)
   ═════════════════════════════════════════════════════════════════════ */

const REVENUE_BANDS: { label: string; mid: number }[] = [
  { label: '$1M–$5M',   mid: 3_000_000 },
  { label: '$5M–$10M',  mid: 7_500_000 },
  { label: '$10M–$25M', mid: 17_500_000 },
  { label: '$25M–$50M', mid: 37_500_000 },
  { label: '$50M+',          mid: 75_000_000 },
];
const INDUSTRIES = ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail', 'Other'] as const;
const INVOLVEMENT = [
  { label: 'Full-time operator',       mult: 1.20 },
  { label: 'Part-time',                mult: 0.90 },
  { label: 'Management team runs it',  mult: 0.65 },
] as const;
const INDUSTRY_RATE: Record<string, number> = {
  Services: 0.040, Manufacturing: 0.028, Healthcare: 0.030, Technology: 0.018,
  Construction: 0.045, Retail: 0.022, Other: 0.030,
};
const MULTIPLE_LOW = 5;
const MULTIPLE_HIGH = 6;

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n.toFixed(0)}`;
}

function AddBackEstimator({ onSend }: { onSend: (text: string) => void }) {
  const [revIdx, setRevIdx] = useState<number | null>(null);
  const [industry, setIndustry] = useState<string | null>(null);
  const [invIdx, setInvIdx] = useState<number | null>(null);

  const result = useMemo(() => {
    if (revIdx === null || industry === null || invIdx === null) return null;
    const rev = REVENUE_BANDS[revIdx].mid;
    const rate = INDUSTRY_RATE[industry];
    const mult = INVOLVEMENT[invIdx].mult;
    const center = rev * rate * mult;
    const low = center * 0.8;
    const high = center * 1.3;
    return { addbackLow: low, addbackHigh: high, evLow: low * MULTIPLE_LOW, evHigh: high * MULTIPLE_HIGH };
  }, [revIdx, industry, invIdx]);

  const sendToYulia = () => {
    if (revIdx === null || industry === null || invIdx === null) return;
    const rev = REVENUE_BANDS[revIdx].label;
    onSend(`I want my actual add-back analysis. Revenue ${rev}, industry ${industry}, owner is ${INVOLVEMENT[invIdx].label.toLowerCase()}.`);
  };

  return (
    <>
      <H2>How much value is hiding in your financials?</H2>
      <p className="gg-body--sub" style={{ marginBottom: 40 }}>
        A quick estimate based on industry patterns. Yulia’s real analysis is specific to your numbers.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760, marginBottom: 32 }}>
        <EstimatorInput label="Annual revenue" options={REVENUE_BANDS.map(b => b.label)} activeIdx={revIdx} onPick={setRevIdx} />
        <EstimatorInput label="Industry" options={INDUSTRIES as unknown as string[]} activeIdx={industry ? INDUSTRIES.indexOf(industry as typeof INDUSTRIES[number]) : null} onPick={i => setIndustry(INDUSTRIES[i])} />
        <EstimatorInput label="Owner involvement" options={INVOLVEMENT.map(i => i.label)} activeIdx={invIdx} onPick={setInvIdx} />
      </div>

      {result && (
        <Card padding={32} style={{ maxWidth: 760 }}>
          <div className="gg-label" style={{ marginBottom: 8 }}>Estimated hidden value</div>
          <div className="gg-stat" style={{ marginBottom: 12, fontSize: 'clamp(36px, 4.5vw, 52px)' }}>
            {fmtMoney(result.addbackLow)} &ndash; {fmtMoney(result.addbackHigh)}
          </div>
          <p className="gg-body" style={{ marginBottom: 8 }}>
            At a typical 5–6&times; multiple, that’s{' '}
            <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>
              {fmtMoney(result.evLow)}–{fmtMoney(result.evHigh)}
            </strong>{' '}in enterprise value.
          </p>
          <p className="gg-body" style={{ marginTop: 14, fontSize: 13, color: 'var(--gg-text-muted)', marginBottom: 20 }}>
            These are industry-pattern estimates. The real number is in your specific financials.
          </p>
          <button type="button" className="gg-btn gg-btn--primary" onClick={sendToYulia}>
            Get your actual analysis &rarr;
          </button>
        </Card>
      )}
    </>
  );
}

function EstimatorInput({ label, options, activeIdx, onPick }: {
  label: string; options: string[]; activeIdx: number | null; onPick: (i: number) => void;
}) {
  return (
    <div>
      <div className="gg-label" style={{ marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            className={`gg-chip${i === activeIdx ? ' active' : ''}`}
            aria-pressed={i === activeIdx}
            onClick={() => onPick(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
