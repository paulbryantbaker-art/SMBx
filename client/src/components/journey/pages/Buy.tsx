/**
 * Glass Grok · /buy (desktop rebuild)
 * ─────────────────────────────────────────────────────────────────────
 * Spec: Glass Grok/SMBX_SITE_COPY.md (page 3) + desktop spec.
 * 2-col hero (ScoreRing peek), 3 capability zigzag heroes, interactive
 * Rundown preview, SBA dark alert banner, horizontal 5-phase timeline,
 * dark stat bar, dark bottom CTA.
 */

import { Fragment, useMemo, useState } from 'react';
import {
  Page, JourneyHero, Section, H2, Body,
  StatBar, Card, BottomCta, AlertBanner, GiantAnchor,
  HorizontalTimeline, SectionNav,
  type JourneyTab,
} from '../primitives';
import { ScoreRing, CapitalStack, RundownBars } from '../mockups';

interface Props { onSend: (text: string) => void; onStartFree: () => void; onNavigate?: (d: JourneyTab) => void; }

const CHIPS = [
  'Score this deal (paste URL)',
  'Model the capital stack',
  'Stress-test the guarantee',
  'What should I offer?',
] as const;

const SECNAV = [
  { id: 'the-problem',        label: 'Problem' },
  { id: 'hero-1-the-rundown', label: 'Rundown' },
  { id: 'hero-2-sba-sop-50-10-8', label: 'SBA' },
  { id: 'hero-3-stress-test', label: 'Stress test' },
  { id: 'try-it',             label: 'Try it' },
  { id: 'the-buy-process',    label: 'Process' },
  { id: 'by-the-numbers',     label: 'Numbers' },
];

export default function Buy({ onSend, onStartFree, onNavigate }: Props) {
  return (
    <Page active="buy" onNavigate={onNavigate} onStartFree={onStartFree}>
      <SectionNav items={SECNAV} />
      <JourneyHero
        eyebrow="Buy-side · searchers, sponsors, PE, and the analysts screening for them"
        headline="Screen ten deals in the time it takes to screen one."
        tagline="Yulia scores any deal in 90 seconds on seven dimensions, models the capital stack under current SBA rules, and stress-tests the personal guarantee before you sign. For searchers, independent sponsors, PE associates, and the analysts building models on all of it."
        chatPlaceholder="Paste a listing URL, describe a deal, or tell Yulia what you\u2019re looking for\u2026"
        chips={CHIPS}
        onSend={onSend}
        onChip={onSend}
        rightPanel={
          <Card padding={32} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
            <div className="gg-label" style={{ marginBottom: 20 }}>Live preview · Phoenix pest control</div>
            <ScoreRing score={87} verdict="Pursue" band="hi" />
            <div style={{ marginTop: 28 }}>
              <RundownBars />
            </div>
          </Card>
        }
      />

      {/* Problem */}
      <Section variant="tint" label="The problem">
        <H2>3,000 deals screened. 1 closed. That’s the math.</H2>
        <div className="gg-two-col" style={{ marginTop: 48, alignItems: 'start' }}>
          <div>
            <Body>The buy-side funnel hasn’t changed in two decades. Three thousand opportunities to get to one close. Eighteen months of burn rate. Eighty-five thousand dollars in busted diligence on deals that should have been dead before the first phone call.</Body>
            <Body>Most of that waste happens in the first filter. Screening a deal properly &mdash; concentration, margins, revenue quality, owner dependency, management depth, financial integrity, scalability &mdash; takes an experienced analyst four hours. Three thousand deals at four hours each is twelve thousand hours.</Body>
          </div>
          <div>
            <Body>The work that separates good deals from bad deals isn’t complex. It’s the same seven dimensions every PE associate checks instinctively after five hundred reps. But doing it three thousand times, consistently, without fatigue, without falling in love with revenue numbers &mdash; that’s the bottleneck.</Body>
            <Body><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 600 }}>Yulia removes the bottleneck.</strong> Every deal scored the same way. In 90 seconds. Pursue or pass before you spend a dollar.</Body>
          </div>
        </div>
      </Section>

      {/* Hero 1 Rundown — 60/40 text, ScoreRing card tight */}
      <Section label="Hero 1 · The Rundown">
        <div className="gg-two-col gg-two-col--60-40" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">Seven dimensions. Sixty seconds. Pursue or pass.</H2>
            <Body lead>Concentration. Margins. Revenue quality. Owner dependency. Management depth. Financial integrity. Scalability.</Body>
            <Body>These are the seven things an experienced buyer checks instinctively on every deal. Together they predict close rate and performance better than any single metric.</Body>
            <Body>Paste a listing URL. Upload a teaser. Type a description. Yulia classifies the business, identifies red flags, scores each dimension 1–10, and gives you a total score with a clear recommendation.</Body>
            <Body>Across thousands of analyses, deals scoring below 40 died in diligence <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>78%</strong> of the time. Deals scoring above 70 closed and performed as modeled <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>83%</strong> of the time.</Body>
          </div>
          <div>
            <Card padding={40} style={{ textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
              <div className="gg-label" style={{ marginBottom: 24 }}>Typical hi-band outcome</div>
              <ScoreRing score={91} verdict="Pursue" band="hi" />
              <p className="gg-body" style={{ marginTop: 20, marginBottom: 0, fontSize: 13, color: 'var(--gg-text-muted)' }}>
                Scoring 70+ correlates with 83% close rate at modeled performance.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Hero 2 SBA — 45/55 reversed, capital stack left */}
      <Section variant="tint" label="Hero 2 · SBA SOP 50 10 8">
        <div className="gg-two-col gg-two-col--45-55 gg-two-col--reverse" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">Your rollover just died. Yulia rebuilds it.</H2>
            <Body>SBA SOP 50 10 8 took effect June 1, 2025. It’s the most disruptive regulatory change in two decades for SMB and lower middle market deals. Forty-one percent of brokers report deal delays. Rollover equity is effectively dead.</Body>
            <Body>Every practitioner trying to close an SBA-financed deal right now is figuring out how to restructure under the new rules. Lawyers charge $1,000 an hour to model scenarios.</Body>
            <Body>Yulia models SOP 50 10 8 structures in 90 seconds. Senior debt, mezzanine, seller notes with correct standby terms, equity injection requirements, SBA 7(a) eligibility. Restructures killed deals into closable ones.</Body>
            <Body>This is the single hardest thing to replicate with ChatGPT and a weekend. The knowledge is specialized, the math is structural, and the rules shift.</Body>
          </div>
          <div>
            <Card padding={32} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
              <div className="gg-label" style={{ marginBottom: 16 }}>Restructured cap stack · $3.2M deal</div>
              <CapitalStack />
              <p className="gg-body" style={{ marginTop: 20, marginBottom: 0, fontSize: 12.5, color: 'var(--gg-text-muted)', lineHeight: 1.55 }}>
                Senior 65% · Mezz 12% · Seller standby 15% · Equity injection 10% (genuine cash per SOP 50 10 8).
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Hero 3 Stress test — 45/55, grid gets more room */}
      <Section label="Hero 3 · Stress test">
        <div className="gg-two-col gg-two-col--45-55" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">Know exactly where the deal breaks before you guarantee it.</H2>
            <Body>The personal guarantee is real. The unlimited liability is real. The unwind scenario is real. Most buyers sign anyway because they’ve modeled the base case on a napkin.</Body>
            <Body>Yulia stress-tests every deal against the scenarios that actually kill acquisitions. Revenue down 10%, 15%, 25%. Margins compressed 200bps. Largest customer leaves. Interest rates move 150bps. DSCR at every intersection.</Body>
            <Body>On a $25M acquisition, base-case DSCR of 2.1&times; feels comfortable. At revenue down 25%, it drops to <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>0.9&times;</strong>. That’s your floor.</Body>
            <Body>You sign the guarantee knowing exactly where the line is. Not hoping. Knowing.</Body>
          </div>
          <div>
            <DscrGrid />
          </div>
        </div>
      </Section>

      {/* Giant-type anchor — the buy-side funnel math in oversized type */}
      <GiantAnchor
        eyebrow="The anchor"
        headline={
          <>
            <span style={{ display: 'block' }}>3,000 deals.</span>
            <span style={{ display: 'block' }}>1 closes.</span>
            <span style={{ display: 'block' }}>Is yours in the 1?</span>
          </>
        }
        subhead="The buy-side funnel hasn\u2019t changed in two decades. Three thousand opportunities, eighteen months of burn, eighty-five thousand in busted diligence. Yulia kills the 2,999 that should be dead in 90 seconds each, so the one that isn\u2019t gets your full attention."
        chatPlaceholder="Paste a deal, a teaser, or a URL\u2026"
        chips={['Score this deal', 'What would kill it?', 'Compare to my last 3']}
        onSend={onSend}
      />

      {/* Interactive — Deal Rundown preview */}
      <Section variant="tint" label="Try it">
        <DealRundownPreview onSend={onSend} />
      </Section>

      {/* SBA alert banner (dark inverted) */}
      <AlertBanner
        label="Regulatory alert"
        heading="SOP 50 10 8 changed every SBA-financed deal."
        leftHeading="Effective June 1, 2025"
        leftItems={[
          'Rollover equity effectively eliminated',
          'Seller notes only count as equity on full standby',
          'Partial change-of-ownership must be stock purchases',
          '10% equity injection must be genuine cash',
          'Financial covenants tightened',
        ]}
        rightHeading="What Yulia models now"
        rightItems={[
          'Restructured equity injection paths',
          'Standby seller note structures that qualify',
          'Full change-of-ownership conversions',
          'Alternative buyer contribution sources',
        ]}
        ctaLabel="Restructure my deal"
        onCta={() => onSend('My deal was structured under the old SBA rules. Help me restructure it under SOP 50 10 8.')}
      />

      {/* 5-phase timeline */}
      <Section label="The buy process">
        <H2>How Yulia runs a buy-side deal.</H2>
        <div style={{ marginBottom: 48 }} />
        <HorizontalTimeline phases={[
          { idx: 'Phase 1 · Free', name: 'Thesis',
            body: 'Define what you’re looking for. Industry, geography, deal size, capital structure, operating vs passive involvement.' },
          { idx: 'Phase 2', name: 'Screen',
            body: 'The Rundown on every deal that enters the pipeline. Seven dimensions, 90 seconds. Kill the 62% that will never close.' },
          { idx: 'Phase 3', name: 'Model',
            body: 'For deals worth pursuing: full model, capital stack under SOP 50 10 8, DSCR sensitivity, IRR across exit scenarios.' },
          { idx: 'Phase 4', name: 'Diligence',
            body: '147-item DD checklist generated from the deal specifics. QofE preview. Risk summary. Working capital model.' },
          { idx: 'Phase 5', name: 'Close & operate',
            body: 'LOI drafted. Working capital peg set. Funds flow coordinated. 180-day PMI plan auto-generated before the wire hits.' },
        ]} />
      </Section>

      {/* Dark stat bar */}
      <Section variant="dark" label="By the numbers">
        <StatBar items={[
          { value: '3,000 → 1', label: 'Traditional search funnel' },
          { value: '$34K',           label: 'Average busted diligence cost per dead deal' },
          { value: '78%',            label: 'Sub-40 deals that die in diligence' },
        ]} />
      </Section>

      <BottomCta
        heading="Paste a deal. Get a score. Free."
        subhead="The first 3 deals you screen on smbX are free. No credit card."
        chatPlaceholder="Paste a URL, describe a deal, or tell Yulia what you’re looking for…"
        onSend={onSend}
      />
    </Page>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   DSCR GRID — Hero 3 (stress test) mockup
   Small 5x5 matrix showing DSCR at revenue/rate intersections.
   Failing cells (<1.0x) get dark-filled treatment for immediate read.
   ═════════════════════════════════════════════════════════════════════ */

function DscrGrid() {
  /* Columns: revenue change (0%, -10%, -15%, -20%, -25%)
     Rows:    interest-rate change (+0, +50bps, +100bps, +150bps) */
  const cols = ['0%', '-10%', '-15%', '-20%', '-25%'];
  const rows = ['+0 bps', '+50 bps', '+100 bps', '+150 bps'];
  const dscr: number[][] = [
    [2.1, 1.7, 1.4, 1.2, 0.9],
    [1.9, 1.5, 1.3, 1.0, 0.8],
    [1.7, 1.4, 1.1, 0.9, 0.7],
    [1.5, 1.2, 0.9, 0.7, 0.5],
  ];
  const bandFor = (v: number): React.CSSProperties => {
    if (v >= 1.5) return { background: 'var(--gg-bg-card)', color: 'var(--gg-text-primary)' };
    if (v >= 1.0) return { background: 'var(--gg-bg-subtle)', color: 'var(--gg-text-primary)' };
    return                { background: 'var(--gg-accent)', color: '#fff' };
  };
  return (
    <Card padding={28} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>DSCR sensitivity</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Base 2.1&times;</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--gg-text-muted)', marginBottom: 12 }}>Revenue change &rarr;</div>
      <div style={{ display: 'grid', gridTemplateColumns: '72px repeat(5, 1fr)', gap: 4 }}>
        <div />
        {cols.map(c => (
          <div key={c} style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, textAlign: 'center', color: 'var(--gg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>{c}</div>
        ))}
        {rows.map((r, ri) => (
          <Fragment key={ri}>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.04em', display: 'flex', alignItems: 'center' }}>{r}</div>
            {cols.map((_, ci) => (
              <div
                key={ci}
                style={{
                  ...bandFor(dscr[ri][ci]),
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontFamily: 'var(--gg-display)',
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: 4,
                  border: '0.5px solid var(--gg-border)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {dscr[ri][ci].toFixed(1)}&times;
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   DEAL SCORE PICKER — chip-picker Rundown.
   Four qualitative picks map to a 0-100 score using heuristics. Every
   dimension weight is opinionated and transparent. Preview only — the
   real Rundown runs 22 deterministic formulas against verified data.
   ═════════════════════════════════════════════════════════════════════ */

const RUNDOWN_DIMENSIONS = [
  'Concentration', 'Margins', 'Revenue quality', 'Dependency',
  'Management', 'Financials', 'Scalability',
] as const;

type ConcentrationPick = 'diversified' | 'moderate' | 'concentrated';
type MarginPick        = 'thin' | 'healthy' | 'strong';
type DependencyPick    = 'absent' | 'operator' | 'key-person';
type GrowthPick        = 'declining' | 'flat-5' | '5-15' | '15-plus';

const CONC_OPTIONS: { k: ConcentrationPick; label: string }[] = [
  { k: 'diversified',  label: 'Top customer <10%' },
  { k: 'moderate',     label: '10–25%' },
  { k: 'concentrated', label: '>25%' },
];
const MARGIN_OPTIONS: { k: MarginPick; label: string }[] = [
  { k: 'thin',    label: 'Thin (<10%)' },
  { k: 'healthy', label: 'Healthy (10–20%)' },
  { k: 'strong',  label: 'Strong (20%+)' },
];
const DEP_OPTIONS: { k: DependencyPick; label: string }[] = [
  { k: 'absent',     label: 'Absent owner' },
  { k: 'operator',   label: 'Operator, not key-person' },
  { k: 'key-person', label: 'Holds key relationships' },
];
const GROWTH_OPTIONS: { k: GrowthPick; label: string }[] = [
  { k: 'declining', label: 'Flat / declining' },
  { k: 'flat-5',    label: '0–5%' },
  { k: '5-15',      label: '5–15%' },
  { k: '15-plus',   label: '15%+' },
];

/* Map each pick to a 0-10 score for the dimension it most affects;
   other dimensions get reasonable defaults. Keeps the 7-bar detail
   honest even though only 4 picks drive it. */
function scoreFromPicks(c: ConcentrationPick, m: MarginPick, d: DependencyPick, g: GrowthPick): {
  dims: number[]; total: number; verdict: 'PURSUE' | 'DEEPER LOOK' | 'PASS';
} {
  const cScore = c === 'diversified' ? 9 : c === 'moderate' ? 6 : 2;
  const mScore = m === 'strong' ? 9 : m === 'healthy' ? 7 : 3;
  const revQ   = m === 'strong' ? 8 : m === 'healthy' ? 7 : 4;
  const dScore = d === 'absent' ? 9 : d === 'operator' ? 6 : 2;
  const mgmt   = d === 'absent' ? 8 : d === 'operator' ? 6 : 3;
  const fin    = m === 'strong' ? 8 : m === 'healthy' ? 6 : 4;
  const scal   = g === '15-plus' ? 9 : g === '5-15' ? 7 : g === 'flat-5' ? 5 : 2;

  const dims = [cScore, mScore, revQ, dScore, mgmt, fin, scal];
  const total = Math.round((dims.reduce((a, b) => a + b, 0) / (RUNDOWN_DIMENSIONS.length * 10)) * 100);
  const verdict: 'PURSUE' | 'DEEPER LOOK' | 'PASS' =
    total >= 70 ? 'PURSUE' : total >= 45 ? 'DEEPER LOOK' : 'PASS';
  return { dims, total, verdict };
}

function DealRundownPreview({ onSend }: { onSend: (text: string) => void }) {
  const [concentration, setConcentration] = useState<ConcentrationPick | null>(null);
  const [margin,        setMargin]        = useState<MarginPick | null>(null);
  const [dependency,    setDependency]    = useState<DependencyPick | null>(null);
  const [growth,        setGrowth]        = useState<GrowthPick | null>(null);

  const result = useMemo(() => {
    if (!concentration || !margin || !dependency || !growth) return null;
    return scoreFromPicks(concentration, margin, dependency, growth);
  }, [concentration, margin, dependency, growth]);

  const verdictStyle = useMemo(() => {
    if (!result) return { bg: 'var(--gg-bg-subtle)', fg: 'var(--gg-text-muted)' };
    if (result.verdict === 'PURSUE')      return { bg: 'var(--gg-band-hi-bg)',   fg: 'var(--gg-band-hi-fg)' };
    if (result.verdict === 'DEEPER LOOK') return { bg: 'var(--gg-band-med-bg)',  fg: 'var(--gg-band-med-fg)' };
    return                                       { bg: 'var(--gg-band-flag-bg)', fg: 'var(--gg-band-flag-fg)' };
  }, [result]);

  const sendToYulia = () => {
    if (!result) return;
    const c = CONC_OPTIONS.find(o => o.k === concentration)!.label.toLowerCase();
    const m = MARGIN_OPTIONS.find(o => o.k === margin)!.label.toLowerCase();
    const d = DEP_OPTIONS.find(o => o.k === dependency)!.label.toLowerCase();
    const g = GROWTH_OPTIONS.find(o => o.k === growth)!.label.toLowerCase();
    onSend(
      `I scored a deal on the home-page Rundown: concentration ${c}, margins ${m}, owner ${d}, growth ${g}. ` +
      `Got a ${result.total}/100 \u2014 ${result.verdict.toLowerCase()}. Run the real 22-formula Rundown against the actual financials.`
    );
  };

  return (
    <>
      <H2>Score a deal right now.</H2>
      <p className="gg-body--sub" style={{ marginBottom: 40 }}>
        Four picks. Yulia gives you a Rundown score and a verdict. Real deal, real financials \u2014 push it to Yulia for the full 22-formula analysis.
      </p>

      <div className="gg-demo-grid" style={{ maxWidth: 1120 }}>
        {/* ── Inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <PickRow label="Customer concentration" options={CONC_OPTIONS}   value={concentration} onPick={setConcentration} />
          <PickRow label="EBITDA margin"          options={MARGIN_OPTIONS} value={margin}        onPick={setMargin} />
          <PickRow label="Owner involvement"      options={DEP_OPTIONS}    value={dependency}    onPick={setDependency} />
          <PickRow label="Revenue growth"         options={GROWTH_OPTIONS} value={growth}        onPick={setGrowth} />
        </div>

        {/* ── Output card ── */}
        <div
          className="gg-card"
          style={{
            padding: 32,
            borderRadius: 22,
            background: result ? 'var(--gg-bg-card)' : 'var(--gg-bg-card)',
            borderColor: result ? 'var(--gg-text-primary)' : 'var(--gg-border)',
            transition: 'border-color 240ms var(--gg-ease-spring)',
            minHeight: 380,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {!result ? (
            <>
              <div className="gg-label" style={{ marginBottom: 8, color: 'var(--gg-text-faint)' }}>Rundown score</div>
              <div style={{
                fontFamily: 'var(--gg-display)', fontWeight: 800,
                fontSize: 'clamp(44px, 5.2vw, 64px)', color: 'var(--gg-text-faint)',
                letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 20,
              }}>
                —/100
              </div>
              <p className="gg-body" style={{ fontSize: 14, color: 'var(--gg-text-muted)', marginTop: 'auto', marginBottom: 0 }}>
                Pick four characteristics to see the score.
              </p>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="gg-label" style={{ marginBottom: 4 }}>Rundown score</div>
                  <div style={{
                    fontFamily: 'var(--gg-display)', fontWeight: 800,
                    fontSize: 'clamp(44px, 5.2vw, 64px)',
                    letterSpacing: '-0.025em', lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {result.total}<span style={{ fontSize: '0.45em', color: 'var(--gg-text-muted)', fontWeight: 600 }}>/100</span>
                  </div>
                </div>
                <div style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--gg-r-pill)',
                  background: verdictStyle.bg,
                  color: verdictStyle.fg,
                  fontFamily: 'var(--gg-display)',
                  fontWeight: 800, fontSize: 13,
                  letterSpacing: '0.08em',
                }}>
                  {result.verdict}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {RUNDOWN_DIMENSIONS.map((dim, i) => (
                  <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ minWidth: 110, fontSize: 12, fontWeight: 600, color: 'var(--gg-text-secondary)' }}>{dim}</div>
                    <div style={{ flex: 1, height: 6, background: 'var(--gg-bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${result.dims[i] * 10}%`, height: '100%',
                        background: result.dims[i] >= 7 ? 'var(--gg-dot-ready)' : result.dims[i] >= 4 ? 'var(--gg-dot-progress)' : 'var(--gg-dot-flag)',
                        transition: 'width 600ms var(--gg-ease-spring)',
                      }} />
                    </div>
                    <div style={{ minWidth: 20, fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--gg-text-primary)' }}>
                      {result.dims[i]}
                    </div>
                  </div>
                ))}
              </div>

              <p className="gg-body" style={{ fontSize: 13, color: 'var(--gg-text-muted)', marginBottom: 20 }}>
                Preview heuristic \u2014 the real Rundown runs 22 deterministic formulas against the actual financials and market data.
              </p>

              <button
                type="button"
                onClick={sendToYulia}
                style={{
                  marginTop: 'auto',
                  padding: '13px 20px',
                  border: 0,
                  borderRadius: 999,
                  background: 'var(--gg-accent)',
                  color: '#fff',
                  fontFamily: 'var(--gg-display)',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '-0.005em',
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  alignSelf: 'flex-start',
                }}
              >
                Run the real Rundown
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function PickRow<K extends string>({ label, options, value, onPick }: {
  label: string;
  options: { k: K; label: string }[];
  value: K | null;
  onPick: (k: K) => void;
}) {
  return (
    <div>
      <div className="gg-label" style={{ marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(o => (
          <button
            key={o.k}
            type="button"
            className={`gg-chip${o.k === value ? ' active' : ''}`}
            aria-pressed={o.k === value}
            onClick={() => onPick(o.k)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
