/**
 * Glass Grok · /sell
 * ─────────────────────────────────────────────────────────────────────
 * Principal-seller journey. Hero → problem → 3 heroes → estimator →
 * 4-phase process → stat bar → 6 exit paths → bottom CTA.
 *
 * Spec: Glass Grok/SMBX_SITE_COPY.md (page 2)
 */

import { useMemo, useState } from 'react';
import {
  Page, JourneyHero, Section, H2, Body,
  StatBar, Card, CardGrid, Timeline, BottomCta,
} from '../primitives';

interface Props {
  onSend: (text: string) => void;
  onStartFree: () => void;
}

const CHIPS = [
  'What\u2019s my business worth?',
  'Find my hidden add-backs',
  'Draft my CIM',
  'Am I ready to sell?',
] as const;

export default function Sell({ onSend, onStartFree }: Props) {
  const onChip = (chip: string) => onSend(chip);

  return (
    <Page onStartFree={onStartFree}>
      <JourneyHero
        eyebrow="Selling your business"
        headline="Know what you have. Before anyone else does."
        tagline="Yulia finds the value hiding in your financials, builds the documents that sell your business, and manages the process that gets you to the closing table. From first conversation to wire transfer."
        chatPlaceholder="Tell Yulia about your business — industry, revenue, what you\u2019re thinking\u2026"
        chips={CHIPS}
        onSend={onSend}
        onChip={onChip}
      />

      {/* ─── The problem ───────────────────────────────────────────── */}
      <Section label="The problem">
        <H2>75% of owners who sell their business regret it within a year.</H2>
        <Body lead>
          The number comes from the Exit Planning Institute. Thousands of former owners surveyed. The regrets are almost always the same.
        </Body>
        <Body>
          They weren\u2019t financially prepared. They left hundreds of thousands &mdash; sometimes millions &mdash; on the table. In add-backs they never identified. In tax structures they never modeled. In competitive processes they never ran. They accepted the first offer because they had no way to know if it was fair.
        </Body>
        <Body>Most of this was preventable.</Body>
        <Body>
          The owners who sell well share one thing: they knew their numbers before anyone else did. They found the value hiding in their own financials. They prepared the business to look through a buyer\u2019s lens. They ran a process that created competition.
        </Body>
        <Body>Yulia does all of that. Starting in a conversation.</Body>
      </Section>

      {/* ─── Hero 1: Add-backs ─────────────────────────────────────── */}
      <Section variant="tint" label="Hero 1 \u00b7 Add-backs">
        <H2>The money hiding in your tax returns.</H2>
        <Body lead>Reported EBITDA and real EBITDA are almost never the same number.</Body>
        <Body>
          Your accountant\u2019s job is to minimize your taxes. A buyer\u2019s job is to maximize the price they\u2019ll justify to their lender or investment committee. Somewhere between those two numbers is the truth &mdash; and the gap is almost always larger than you think.
        </Body>
        <Body>
          Yulia analyzes your financials through a buyer\u2019s lens. Above-market rent to your own LLC. Owner compensation above market replacement. One-time legal. Personal expenses running through the business. Non-recurring consulting fees. Every legitimate add-back identified, documented, and defensible.
        </Body>
        <Body>
          Average hidden value across hundreds of analyses: <strong style={{ color: 'var(--gg-text-primary)' }}>$1.1M</strong>. At a 5&ndash;6&times; multiple, that\u2019s $5.5M&ndash;$6.6M in enterprise value sitting in the financials.
        </Body>
        <Body>
          A formal Quality of Earnings analysis costs $25K&ndash;$75K and takes 3&ndash;6 weeks. Yulia\u2019s pre-LOI analysis takes 20 minutes. It doesn\u2019t replace the formal QofE &mdash; it tells you what the QofE will find before you spend the money.
        </Body>
      </Section>

      {/* ─── Hero 2: CIM ───────────────────────────────────────────── */}
      <Section label="Hero 2 \u00b7 CIM">
        <H2>Your business deserves better than a data dump.</H2>
        <Body>
          A Confidential Information Memorandum is the single most important document in a sell-side process. It\u2019s what qualified buyers read to decide whether your business is worth their time.
        </Body>
        <Body>
          Most CIMs are data dumps. Revenue tables. Margin charts. An &ldquo;overview&rdquo; section that reads like it was written by someone who\u2019s never visited the business.
        </Body>
        <Body>
          Yulia\u2019s CIM is a strategic narrative. 25&ndash;40 pages. Your business positioned not as a business to buy, but as a platform to scale. Recurring revenue highlighted. Growth thesis articulated. Risk factors addressed with mitigation already in progress.
        </Body>
        <Body>
          The same company, described two ways, can trade at 4.5&times; or 7&times;. The difference is almost never the business. It\u2019s the CIM.
        </Body>
        <Body>
          Generated from the intelligence Yulia builds while working with you &mdash; not from a template. Updated when your financials change. Buyer-ready in hours, not weeks.
        </Body>
      </Section>

      {/* ─── Hero 3: Competitive process ───────────────────────────── */}
      <Section variant="tint" label="Hero 3 \u00b7 Competitive process">
        <H2>One buyer gives you a price. Five buyers give you a market.</H2>
        <Body>
          The competitive process is the single highest-ROI activity in any exit. Most sellers skip it &mdash; because it\u2019s logistically complex, because their broker doesn\u2019t have the bandwidth, because they don\u2019t know it\u2019s an option.
        </Body>
        <Body>
          Yulia manages the entire process. Buyer identification &mdash; strategic, PE, and independent &mdash; mapped and scored by thesis alignment. Outreach sequencing. IOI comparison matrix that shows not just the headline price, but the terms, structure, earnout risk, working capital treatment, and what each offer actually puts in your pocket.
        </Body>
        <Body>
          The winning bid in a competitive process is typically 15&ndash;30% above the initial offer. On a $50M transaction, that\u2019s $7.5M&ndash;$15M more &mdash; from running a process instead of accepting a number.
        </Body>
      </Section>

      {/* ─── Interactive: Add-back estimator ───────────────────────── */}
      <Section label="Estimator">
        <AddBackEstimator onSend={onSend} />
      </Section>

      {/* ─── 4-phase process ───────────────────────────────────────── */}
      <Section variant="tint" label="The process">
        <H2>How your exit actually works.</H2>
        <Body lead style={{ marginBottom: 28 }}>Six months to two years. One guided workflow.</Body>
        <Timeline
          phases={[
            { label: 'Phase 1 \u2014 UNDERSTAND', window: 'Months 1\u20132', free: true,
              body: 'See your business through a buyer\u2019s lens before a buyer does. Financials normalized. Add-backs found. AI-estimated value range against your market. Every risk flagged while you can still fix it.',
              deliverables: 'Preliminary value range \u00b7 Add-back analysis \u00b7 Exit readiness score (7 factors) \u00b7 Market positioning \u00b7 Preparation roadmap' },
            { label: 'Phase 2 \u2014 OPTIMIZE', window: 'Months 3\u201312',
              body: '$50K improvement in EBITDA at 5\u00d7 = $250K more at closing. Yulia builds the optimization roadmap with dollar impact on every action item. Concentration. Dependency. Revenue quality. Financial documentation.',
              deliverables: 'Prioritized improvement plan \u00b7 Dollar impact per action \u00b7 Progress tracking \u00b7 Milestone projections' },
            { label: 'Phase 3 \u2014 PREPARE', window: 'Months 6\u201318',
              body: 'CIM. Financial exhibits. Buyer targeting. Deal room. Everything a qualified buyer needs to make a decision \u2014 generated from the intelligence Yulia builds during months of working with you.',
              deliverables: 'CIM (25\u201340 pages, living document) \u00b7 Blind teaser \u00b7 Buyer universe \u00b7 Deal room setup \u00b7 Outreach strategy' },
            { label: 'Phase 4 \u2014 CLOSE', window: 'Months 12\u201324',
              body: 'LOI evaluation. Structure modeling. Earnout analysis. Working capital. Competitive process management. Negotiation preparation. Closing coordination.',
              deliverables: 'IOI/LOI comparison \u00b7 Deal structure modeling \u00b7 DD coordination \u00b7 Working capital analysis \u00b7 Closing checklist' },
          ]}
        />
      </Section>

      {/* ─── Stat bar ──────────────────────────────────────────────── */}
      <Section tight>
        <StatBar items={[
          { value: '$1.1M',  label: 'Average hidden value found per analysis' },
          { value: '30 min', label: 'Average time to first deliverable' },
          { value: '4\u20137\u00d7', label: 'Typical preparation premium on enterprise value' },
        ]} />
      </Section>

      {/* ─── Exit paths (6 cards) ──────────────────────────────────── */}
      <Section variant="tint" label="Exit paths">
        <H2>Selling 100% isn\u2019t your only option.</H2>
        <Body lead style={{ marginBottom: 28 }}>Yulia models every exit structure against your specific numbers. In one conversation.</Body>
        <CardGrid>
          {EXIT_PATHS.map(p => (
            <Card key={p.title}>
              <h3 className="gg-h3" style={{ marginBottom: 8 }}>{p.title}</h3>
              <p className="gg-body" style={{ marginBottom: 0, fontSize: 14 }}>{p.body}</p>
            </Card>
          ))}
        </CardGrid>
        <p className="gg-body" style={{ marginTop: 24, fontSize: 14, color: 'var(--gg-text-muted)' }}>
          Yulia shows you every path with after-tax proceeds, retained ownership, ongoing cash flow, and control implications. Side by side. Same financials. Different outcomes.
        </p>
      </Section>

      {/* ─── Bottom CTA ────────────────────────────────────────────── */}
      <BottomCta
        heading="Tell Yulia about your business."
        subhead="The first conversation is free. The first deliverable is free. Start when you\u2019re ready."
        chatPlaceholder="Industry, revenue, what you\u2019re thinking\u2026"
        onSend={onSend}
      />
    </Page>
  );
}

const EXIT_PATHS = [
  { title: 'Full Sale',                         body: 'Sell 100%. Maximum immediate liquidity. Clean break. Best for owners ready to exit entirely.' },
  { title: 'Majority Sale with Rollover',       body: 'Sell 51\u201380% to PE or a strategic acquirer. Cash off the table today. Keep equity for a second bite when the business exits again in 3\u20135 years.' },
  { title: 'Minority Equity Raise',             body: 'Sell 20\u201340% to a growth investor. Access capital without giving up control. Stay in the operator seat.' },
  { title: 'ESOP',                              body: 'Sell to your employees through an Employee Stock Ownership Plan. Significant tax advantages via Section 1042. Stay as chairman. Culture preserved.' },
  { title: 'Recapitalization',                  body: 'Dividend recap with debt. Take $15M\u2013$40M in cash off the table. Retain 100% equity. Keep growing the business.' },
  { title: 'Partial Asset Sale',                body: 'Sell a division, license IP, or sell-leaseback real estate. Unlock value without a full exit.' },
];

/* ═════════════════════════════════════════════════════════════════════
   ADD-BACK ESTIMATOR — interactive
   ═════════════════════════════════════════════════════════════════════ */

const REVENUE_BANDS: { label: string; mid: number }[] = [
  { label: '$1M\u2013$5M',   mid: 3_000_000 },
  { label: '$5M\u2013$10M',  mid: 7_500_000 },
  { label: '$10M\u2013$25M', mid: 17_500_000 },
  { label: '$25M\u2013$50M', mid: 37_500_000 },
  { label: '$50M+',          mid: 75_000_000 },
];
const INDUSTRIES = ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail', 'Other'] as const;
const INVOLVEMENT = [
  { label: 'Full-time operator',        mult: 1.20 },
  { label: 'Part-time',                  mult: 0.90 },
  { label: 'Management team runs it',    mult: 0.65 },
] as const;

/* Industry-pattern add-back rate as % of revenue. Services and construction
   tend to have the most owner-blended expenses; technology and retail have
   the least. These are pattern estimates, not your specific numbers. */
const INDUSTRY_RATE: Record<string, number> = {
  Services:      0.040,
  Manufacturing: 0.028,
  Healthcare:    0.030,
  Technology:    0.018,
  Construction:  0.045,
  Retail:        0.022,
  Other:         0.030,
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
    return {
      addbackLow: low, addbackHigh: high,
      evLow: low * MULTIPLE_LOW, evHigh: high * MULTIPLE_HIGH,
    };
  }, [revIdx, industry, invIdx]);

  const sendToYulia = () => {
    if (revIdx === null || industry === null || invIdx === null) return;
    const rev = REVENUE_BANDS[revIdx].label;
    onSend(`I want my actual add-back analysis. Revenue ${rev}, industry ${industry}, owner is ${INVOLVEMENT[invIdx].label.toLowerCase()}.`);
  };

  return (
    <>
      <H2>How much value is hiding in your financials?</H2>
      <Body lead style={{ marginBottom: 28 }}>
        A quick estimate based on industry patterns. Yulia\u2019s real analysis is specific to your numbers.
      </Body>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720, marginBottom: 28 }}>
        <EstimatorInput label="Annual revenue" options={REVENUE_BANDS.map(b => b.label)} activeIdx={revIdx} onPick={setRevIdx} />
        <EstimatorInput label="Industry" options={INDUSTRIES as unknown as string[]} activeIdx={industry ? INDUSTRIES.indexOf(industry as typeof INDUSTRIES[number]) : null} onPick={i => setIndustry(INDUSTRIES[i])} />
        <EstimatorInput label="Owner involvement" options={INVOLVEMENT.map(i => i.label)} activeIdx={invIdx} onPick={setInvIdx} />
      </div>

      {result && (
        <Card padding={28} style={{ background: 'var(--gg-bg-app)' }}>
          <div className="gg-label" style={{ marginBottom: 8 }}>Estimated hidden value</div>
          <div className="gg-stat" style={{ marginBottom: 8 }}>
            {fmtMoney(result.addbackLow)} &ndash; {fmtMoney(result.addbackHigh)}
          </div>
          <p className="gg-body" style={{ marginBottom: 4 }}>
            At a typical 5&ndash;6&times; multiple, that\u2019s{' '}
            <strong style={{ color: 'var(--gg-text-primary)' }}>
              {fmtMoney(result.evLow)}&ndash;{fmtMoney(result.evHigh)}
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
      <div className="gg-label" style={{ marginBottom: 10 }}>{label}</div>
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
