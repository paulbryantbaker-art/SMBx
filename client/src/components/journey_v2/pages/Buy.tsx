/**
 * Glass Grok v2 · Buy.tsx — merged SITE_COPY (April 2026) + Atlas Air
 * walkthrough.
 *
 * 6 sections: hero → problem funnel → Rundown → SBA SOP 50 10 8
 * regulatory alert → personal-guarantee stress test → LOI structures.
 * Sourcing + DD sections trimmed in favor of the new 7-dim scoring
 * emphasis + SBA + stress-test sections that are buy-side's biggest
 * 2026 differentiators.
 */
import { useEffect, useState } from 'react';
import {
  DealStep, DealBench, ScoreDonut, DimList, DealBottom,
  type DealTab, type DealStepScript,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
import InteractiveTool from '../shell/InteractiveTool';
import { ACME, ACME_RUNDOWN } from '../acme';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const CHIPS = ['Score Acme', 'Rebuild my SBA stack', 'Stress-test my DSCR', "What should I offer?"] as const;

/* 5-min Acme walkthrough from the buyer side — a searcher (or LMM
   PE associate) evaluating Acme as a platform acquisition. */
const SCRIPT: DealStepScript = {
  3: [
    { who: 'y',  text: `Running the Rundown on <strong>${ACME.name}</strong> — $65M distributor, Phoenix, multi-discipline. Ray Whitaker Jr. is 2nd gen, 58, exploring exit in 18–24 months.` },
    { who: 'y',  text: `Scoring seven dimensions. Total lands at <strong>81/100 · Pursue</strong>. Strong on financial integrity (9.1), scalability (8.0), and revenue quality (8.4) — 62% of revenue repeats on blanket POs.` },
    { who: 'me', text: 'Yellows?' },
    { who: 'y',  text: `Two: <strong>owner dependency (5.4)</strong> — Ray personally signs off on every contract over $50K — and <strong>concentration (6.0)</strong> — top 10 accounts are 35% of revenue, with Marco Delgado (VP Sales, 22yr) holding the relationships. Both are solvable in integration, not reasons to pass.` },
  ],
  4: [
    { who: 'y',  text: `At $11M normalized EBITDA, upper MM distribution trades 7–8.5×. So the price conversation is <strong>$77M–$94M</strong>. Check size for you with a $22M equity round and SBA 7(a) lands around $14M cash-in.` },
    { who: 'y',  text: `SBA SOP 50 10 8 took effect June 2025 — your rollover equity path you probably modeled six months ago is dead. Partial change-of-ownership has to be stock purchases now. 10% equity injection must be genuine cash.` },
    { who: 'me', text: 'Can Acme still work?' },
    { who: 'y',  text: `Yes. Restructured: <strong>$44M SBA 7(a) · $22M unitranche · $18M seller note on full standby · $14M equity</strong>. DSCR base case 1.9×. 10% genuine cash is in the equity tranche, not a seller-note substitute. Compliance-clean.` },
  ],
  5: [
    { who: 'y',  text: `Stressed Ray's numbers against the scenarios that actually kill distribution deals. Base DSCR 1.9×.` },
    { who: 'y',  text: `Revenue down 15%: drops to <strong>1.3×</strong>, inside covenant. Hospitality softens hard in a rate shock — scenario-tested that too, lands 1.25×.` },
    { who: 'y',  text: `The floor breaks at <strong>revenue down 25% or losing Marco's top two accounts</strong>. Structure around that: customer retention escrow ($2M), Marco on a 3-year earnout, and the seller note standby gets written to extend automatically if DSCR tests breach.` },
  ],
  6: [
    { who: 'y',  text: `Three LOI structures, all compliant. Recommended: <strong>$86M · 60% cash · 20% rollover · 20% seller note (standby)</strong>.` },
    { who: 'y',  text: `Maximizes Ray's after-tax NPV at $64M — his CPA is going to love the rollover deferral — and keeps your equity check at $14M. The rollover also aligns Ray through year 3, exactly when the concentration risk unwinds into formalized contracts.` },
    { who: 'me', text: 'Send it?' },
    { who: 'y',  text: `Draft is ready. Two optional standby provisions I'd add: pre-closing working capital peg at $4.8M (their trailing 12-mo average), and a management retention pool for Nina + Jennifer + Marco. Say the word.` },
  ],
};

type SbaItem = { label: string; detail: string };
const SBA_BROKE: readonly SbaItem[] = [
  { label: 'Rollover equity', detail: 'Effectively eliminated' },
  { label: 'Seller notes', detail: 'Only count as equity on full standby' },
  { label: 'Partial change-of-ownership', detail: 'Must be stock purchases' },
  { label: 'Equity injection', detail: '10% must be genuine cash' },
  { label: 'Financial covenants', detail: 'Tightened materially' },
];
const SBA_WORKS: readonly SbaItem[] = [
  { label: 'Restructured equity paths', detail: 'Genuine-cash contribution sources' },
  { label: 'Qualifying seller notes', detail: 'Full-standby structures that pass' },
  { label: 'Stock-purchase conversions', detail: 'Full change-of-ownership compliance' },
  { label: 'Alternative contributions', detail: '401(k) rollovers, ROBS, family gifts' },
];

type Shock = { label: string; margin: string; ebitdaDown: string; dscr: number };
const BASE_DSCR = 1.9;
const SHOCKS: readonly Shock[] = [
  { label: 'Base case',              margin: '–',        ebitdaDown: '–',     dscr: 1.9 },
  { label: 'Revenue –10%',           margin: '–150bps',  ebitdaDown: '–16%',  dscr: 1.5 },
  { label: 'Revenue –15%',           margin: '–200bps',  ebitdaDown: '–26%',  dscr: 1.3 },
  { label: 'Hospitality softens',    margin: '–175bps',  ebitdaDown: '–22%',  dscr: 1.25 },
  { label: 'Marco\'s top 2 leave',   margin: '–150bps',  ebitdaDown: '–32%',  dscr: 1.0 },
  { label: 'Revenue –25%',           margin: '–225bps',  ebitdaDown: '–42%',  dscr: 0.8 },
];

export default function Buy({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      chat={{
        title: 'Yulia',
        status: `Evaluating ${ACME.name}`,
        script: SCRIPT,
        opening: `Hi — I'm <strong>Yulia</strong>. This walkthrough is a buyer (LMM PE / search fund) evaluating <strong>${ACME.name}</strong> — $65M multi-discipline distributor, Phoenix HQ, owner exploring exit. Scroll to watch me score, restructure under SBA SOP 50 10 8, stress-test DSCR, and draft the LOI.`,
        reply: 'Three things: <strong>deal size</strong>, <strong>equity you can contribute</strong>, and a <strong>URL or teaser</strong>. I\'ll return a scored Rundown + compliant capital stack in 15 minutes.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Hero */}
      <DealStep
        n={1}
        id="s1"
        idx="Buy-side"
        title="Screen ten deals in the time it takes to screen one."
        lede={<>Yulia scores any deal in 90 seconds on seven dimensions, models the capital stack under current SBA rules, and stress-tests the personal guarantee before you sign. For searchers, sponsors, and buyers.</>}
      >
        <InteractiveTool
          kicker="The Rundown · live deal calculator"
          sub="Paste a listing URL, drop a teaser, or type a description. Yulia scores 7 dimensions in 90 seconds."
          tag="90 sec · 7 dims"
        >
          <RundownCalculator />
        </InteractiveTool>
      </DealStep>

      {/* Problem funnel */}
      <DealStep
        n={2}
        id="s2"
        idx="The funnel"
        title="3,000 deals screened. 1 closed. That's the math."
        lede={<>The buy-side funnel hasn't changed in two decades. Three thousand opportunities to get to one close. Eighteen months of burn rate. Eighty-five thousand dollars in busted diligence on deals that should have been dead before the first call.</>}
      >
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}>
          <StatCard n="3,000 → 1" label="Traditional search funnel" />
          <StatCard n="$34K" label="Average busted diligence per dead deal" />
          <StatCard n="78%" label="Sub-40 Rundown deals that die in diligence" />
        </div>
      </DealStep>

      {/* Rundown — Acme as the worked example */}
      <DealStep
        n={3}
        id="s3"
        idx={`The Rundown · ${ACME.name}`}
        title="Seven dimensions. Sixty seconds. Pursue or pass."
        lede={<>Concentration. Margins. Revenue quality. Owner dependency. Management depth. Financial integrity. Scalability. Here\'s the live Rundown on Acme — $65M multi-discipline distributor, Phoenix. Total <strong>81/100 · Pursue</strong>.</>}
      >
        <DealBench
          title={`Rundown · ${ACME.name}`}
          meta="8 MIN AGO"
          metaLive
          bodyStyle={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center', padding: '26px 22px' }}
        >
          <div>
            <ScoreDonut score={81} />
            <div style={{ textAlign: 'center', marginTop: -18 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 9,
                letterSpacing: '0.15em',
                color: '#22A755',
                textTransform: 'uppercase',
              }}>Pursue</div>
            </div>
          </div>
          <DimList dims={ACME_RUNDOWN} />
        </DealBench>
      </DealStep>

      {/* SBA SOP 50 10 8 alert */}
      <DealStep
        n={4}
        id="s4"
        idx="Regulatory alert"
        title="SOP 50 10 8 changed every SBA-financed deal."
        lede={<>Effective June 1, 2025. The most disruptive regulatory change in two decades for SMB and lower middle market deals. 41% of brokers report deal delays. Rollover equity is effectively dead. Yulia models the structures that actually qualify — in 90 seconds.</>}
      >
        <div style={{
          marginTop: 18,
          background: '#0A0A0B',
          color: '#fff',
          borderRadius: 14,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.18em',
            padding: '4px 9px',
            border: '0.5px solid rgba(255,255,255,0.3)',
            borderRadius: 4,
          }}>REGULATORY ALERT</div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>If your deal was structured under the old rules, it probably doesn't qualify under the new ones.</div>
        </div>
        <div style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          <SbaCol
            heading="What the new SOP broke"
            tone="red"
            items={SBA_BROKE}
          />
          <SbaCol
            heading="What Yulia models that works"
            tone="green"
            items={SBA_WORKS}
          />
        </div>
      </DealStep>

      {/* Stress test */}
      <DealStep
        n={5}
        id="s5"
        idx="Stress test"
        title="Know exactly where the deal breaks before you guarantee it."
        lede={<>The personal guarantee is real. The unwind scenario is real. Most buyers sign anyway because they've modeled the base case on a napkin. Yulia runs your DSCR against the scenarios that actually kill deals — revenue shocks, margin compression, customer churn, rate moves.</>}
      >
        <DealBench title={`DSCR stress · ${ACME.name} · Base ${BASE_DSCR.toFixed(1)}×`} meta="SHOCK MATRIX">
          <div style={{ padding: 22 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              {SHOCKS.map((s) => {
                const pct = Math.max(0, Math.min(100, (s.dscr / 2.5) * 100));
                const tone =
                  s.dscr >= 1.5 ? { bar: '#22A755', tag: 'HEADROOM', tagColor: '#22A755' } :
                  s.dscr >= 1.25 ? { bar: '#E8A033', tag: 'TIGHT',   tagColor: '#E8A033' } :
                  s.dscr >= 1.0  ? { bar: '#E8A033', tag: 'AT LINE', tagColor: '#E8A033' } :
                                   { bar: '#D44A78', tag: 'BREACH',  tagColor: '#D44A78' };
                return (
                  <div key={s.label} style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 1fr 60px 80px',
                    gap: 12,
                    alignItems: 'center',
                    fontSize: 12.5,
                  }}>
                    <div style={{ fontWeight: 600 }}>{s.label}</div>
                    <div style={{ position: 'relative', height: 18, background: '#F4F4F5', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0, top: 0, bottom: 0,
                        width: `${pct}%`,
                        background: tone.bar,
                        borderRadius: 4,
                        transition: 'width 300ms',
                      }} />
                      <div style={{
                        position: 'absolute',
                        left: `${(1.25 / 2.5) * 100}%`,
                        top: 0, bottom: 0, width: 1,
                        background: 'rgba(0,0,0,0.2)',
                      }} />
                    </div>
                    <div style={{
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 700,
                      textAlign: 'right',
                    }}>{s.dscr.toFixed(1)}×</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                      fontSize: 9.5,
                      letterSpacing: '0.1em',
                      color: tone.tagColor,
                      textAlign: 'right',
                    }}>{tone.tag}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{
            padding: '14px 22px',
            background: '#FAFAFB',
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            fontSize: 12.5,
            lineHeight: 1.55,
            color: '#3A3A3E',
          }}>
            <strong style={{ color: '#0A0A0B' }}>Yulia's take:</strong> Acme breaks at revenue &minus;25% or losing Marco\'s top 2 accounts. Structure around that — customer retention escrow, seller note on 3-year standby, Marco on earnout. You sign the guarantee knowing where the line is. 1.25× covenant reference.
          </div>
        </DealBench>
      </DealStep>

      {/* LOI */}
      <DealStep
        n={6}
        id="s6"
        idx="LOI"
        title="Three LOIs. Three structures. One you can actually close."
        lede={<>Yulia drafts the LOI alongside you — cash/earnout mix, escrow, WC peg, non-competes, exclusivity. She models after-tax outcomes for both sides, so you walk in with the right number, not just a big one.</>}
      >
        <DealBench title={`LOI structures · ${ACME.name}`} meta="3 OPTIONS · SBA-COMPLIANT">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 22 }}>
            <LoiCard label="Aggressive"   price="$94M" terms="70% cash · 25% rollover · 5% earnout · 45-day exclusivity" />
            <LoiCard label="Recommended"  price="$86M" terms="60% cash · 20% rollover · 20% seller note (full standby)" featured />
            <LoiCard label="Conservative" price="$82M" terms="50% cash · 30% rollover · $4M performance earnout" />
          </div>
          <div style={{
            padding: '14px 22px',
            background: '#FAFAFB',
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            fontSize: 12.5,
            lineHeight: 1.55,
            color: '#3A3A3E',
          }}>
            <strong style={{ color: '#0A0A0B' }}>Yulia's take:</strong> Recommended structure maximizes Ray\'s after-tax NPV at ~$64M — rollover defers tax — while keeping your equity check at $14M. Rollover aligns him through year 3, exactly when concentration unwinds as Marco\'s top-10 contracts formalize. All three comply with SOP 50 10 8.
          </div>
        </DealBench>
      </DealStep>

      <DealBottom
        heading="Paste a deal. Get a score. Free."
        sub="The first 3 deals you screen on smbX are free. No credit card."
        placeholder="Paste a URL, describe a deal, or tell Yulia what you're looking for…"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

/* ───────────────────────────────────────────────────────────────────
   RundownCalculator — the front-and-center live scoring tool.
   User pastes / types a description. We animate the 7 dimensions
   scoring in, show a total with PURSUE/DEEPER LOOK/PASS verdict.
   Demo-grade heuristics: score is derived from keyword presence +
   a deterministic hash for repeatable results. The real product
   calls a backend — this is the front-door interactive.
   ─────────────────────────────────────────────────────────────────── */

type DimKey = 'financial' | 'margins' | 'revenue' | 'concentration' | 'management' | 'dependency' | 'scalability';
const DIM_LABELS: Record<DimKey, string> = {
  financial: 'Financial quality',
  margins: 'Margins',
  revenue: 'Revenue quality',
  concentration: 'Concentration',
  management: 'Management depth',
  dependency: 'Owner dependency',
  scalability: 'Scalability',
};

const SAMPLE_DEALS = [
  'HVAC services, $4.2M revenue, 18% EBITDA, 60% recurring contracts, 2nd-gen owner retiring',
  'Specialty distribution, $12M revenue, 22% EBITDA, 3 customers = 55% of revenue',
  'Pest control, Phoenix, $1.2M rev, asking $2.8M, 70% recurring, owner handles top-10 accounts',
];

function scoreDescription(s: string): Record<DimKey, number> {
  /* Lightweight deterministic scoring. Each dim starts at 6, nudged
     by keyword hits (positive or negative). Demo-only — the backend
     does real analysis. */
  const t = s.toLowerCase();
  const has = (needles: string[]) => needles.some((n) => t.includes(n));
  const score: Record<DimKey, number> = {
    financial: 6.5, margins: 6.5, revenue: 6.5, concentration: 6.5, management: 6.5, dependency: 6.5, scalability: 6.5,
  };
  if (has(['clean', 'audited', 'tax return'])) score.financial += 2;
  if (has(['qb', 'cash-basis', 'messy']))      score.financial -= 1.5;
  if (has(['ebitda', 'margin', '20%', '22%', '25%', '18%', '15%'])) score.margins += 1.5;
  if (has(['low-margin', '8%', '10%']))       score.margins -= 1.5;
  if (has(['recurring', 'msa', 'subscription', 'contract'])) score.revenue += 2;
  if (has(['one-time', 'project-based', 'seasonal'])) score.revenue -= 1.5;
  if (has(['concentration', '55%', '60%', 'top 3', 'top-3'])) score.concentration -= 2.5;
  if (has(['diversified', '100+ customer', 'long tail'])) score.concentration += 2;
  if (has(['team', 'management', 'coo', 'vp'])) score.management += 1.5;
  if (has(['solo', 'no team', 'owner-operator'])) score.management -= 2;
  if (has(['owner handles', 'owner runs', 'owner does']))  score.dependency -= 2;
  if (has(['owner stepped back', 'owner absent', 'professional manager'])) score.dependency += 2;
  if (has(['platform', 'scalable', 'expansion', 'roll-up', 'add-on'])) score.scalability += 2;
  if (has(['single market', 'local', 'niche'])) score.scalability -= 1;
  // Clamp 1-10
  (Object.keys(score) as DimKey[]).forEach((k) => {
    score[k] = Math.max(1, Math.min(10, Math.round(score[k] * 10) / 10));
  });
  return score;
}

function RundownCalculator() {
  const [input, setInput] = useState('');
  const [scoring, setScoring] = useState(false);
  const [scores, setScores] = useState<Record<DimKey, number> | null>(null);
  const [revealIdx, setRevealIdx] = useState<number>(0);

  const keys: DimKey[] = ['financial', 'margins', 'revenue', 'concentration', 'management', 'dependency', 'scalability'];

  useEffect(() => {
    if (!scoring || !scores) return;
    if (revealIdx >= keys.length) {
      const t = window.setTimeout(() => setScoring(false), 400);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setRevealIdx((i) => i + 1), 220);
    return () => window.clearTimeout(t);
  }, [scoring, revealIdx, scores, keys.length]);

  const runScore = (text: string) => {
    const s = text.trim();
    if (s.length < 10) return;
    setScores(scoreDescription(s));
    setRevealIdx(0);
    setScoring(true);
  };

  const reset = () => {
    setInput('');
    setScores(null);
    setScoring(false);
    setRevealIdx(0);
  };

  const total = scores ? Math.round(keys.reduce((sum, k) => sum + scores[k], 0) / keys.length * 10) : 0;
  const verdict = total >= 70 ? { label: 'PURSUE', color: '#22A755' } : total >= 40 ? { label: 'DEEPER LOOK', color: '#E8A033' } : { label: 'PASS', color: '#D44A78' };

  return (
    <div>
      {!scores && (
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="Paste a deal URL, teaser summary, or type a description — industry, revenue, EBITDA, owner dynamics..."
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '0.5px solid rgba(0,0,0,0.12)',
              borderRadius: 10,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13.5,
              lineHeight: 1.5,
              resize: 'vertical',
              background: '#FAFAFB',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={input.trim().length < 10}
              onClick={() => runScore(input)}
              style={{
                background: input.trim().length >= 10 ? '#0A0A0B' : '#D8D8DA',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                cursor: input.trim().length >= 10 ? 'pointer' : 'not-allowed',
              }}
            >Score the deal →</button>
            <span style={{ fontSize: 11.5, color: '#6B6B70' }}>Or try a sample:</span>
            {SAMPLE_DEALS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setInput(d); runScore(d); }}
                style={{
                  background: '#FAFAFB',
                  border: '0.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 999,
                  padding: '5px 11px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#3A3A3E',
                  cursor: 'pointer',
                }}
              >Sample {i + 1}</button>
            ))}
          </div>
        </div>
      )}

      {scores && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 32,
            alignItems: 'center',
          }}>
            <div>
              <ScoreDonut score={revealIdx >= keys.length ? total : Math.round((revealIdx / keys.length) * total)} />
              <div style={{ textAlign: 'center', marginTop: -18 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  color: revealIdx >= keys.length ? verdict.color : '#9A9A9F',
                  textTransform: 'uppercase',
                  transition: 'color 200ms',
                }}>
                  {revealIdx >= keys.length ? verdict.label : 'Scoring…'}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {keys.map((k, i) => {
                const revealed = i < revealIdx;
                const v = scores[k];
                const pct = (v / 10) * 100;
                const tone: 'green' | 'amber' | 'red' = v >= 7.5 ? 'green' : v >= 5.5 ? 'amber' : 'red';
                const color = tone === 'green' ? '#22A755' : tone === 'amber' ? '#E8A033' : '#D44A78';
                return (
                  <div key={k} style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr 40px',
                    gap: 12,
                    alignItems: 'center',
                    fontSize: 12.5,
                    opacity: revealed ? 1 : 0.3,
                    transform: revealed ? 'translateX(0)' : 'translateX(-8px)',
                    transition: 'opacity 260ms, transform 260ms',
                  }}>
                    <div style={{ fontWeight: 600, color: revealed ? '#1A1C1E' : '#9A9A9F' }}>{DIM_LABELS[k]}</div>
                    <div style={{ position: 'relative', height: 14, background: '#F4F4F5', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0, top: 0, bottom: 0,
                        width: revealed ? `${pct}%` : '0%',
                        background: color,
                        borderRadius: 3,
                        transition: 'width 380ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }} />
                    </div>
                    <div style={{
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 700,
                      textAlign: 'right',
                      color: revealed ? color : '#9A9A9F',
                    }}>{revealed ? v.toFixed(1) : '—'}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {revealIdx >= keys.length && (
            <div style={{
              marginTop: 18,
              padding: '14px 18px',
              background: '#FAFAFB',
              border: '0.5px solid rgba(0,0,0,0.06)',
              borderRadius: 10,
              fontSize: 12.5,
              lineHeight: 1.55,
              color: '#3A3A3E',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 14,
            }}>
              <div>
                <strong style={{ color: '#0A0A0B' }}>Total {total}/100 · {verdict.label}.</strong> This is a preview score. Yulia\'s full Rundown writes the deal memo, models the capital stack, and flags every risk specific to this deal.
              </div>
              <button
                type="button"
                onClick={reset}
                style={{
                  background: '#fff',
                  border: '0.5px solid rgba(0,0,0,0.12)',
                  borderRadius: 999,
                  padding: '7px 14px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >Try another →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ n, label }: { n: string; label: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 12,
      padding: 22,
    }}>
      <div style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: '-0.02em',
        color: '#0A0A0B',
      }}>{n}</div>
      <div style={{
        marginTop: 6,
        fontSize: 12.5,
        lineHeight: 1.45,
        color: '#3A3A3E',
      }}>{label}</div>
    </div>
  );
}

function SbaCol({ heading, tone, items }: { heading: string; tone: 'red' | 'green'; items: readonly SbaItem[] }) {
  const ink = tone === 'red' ? '#D44A78' : '#22A755';
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 14,
      padding: 22,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: ink,
        marginBottom: 12,
      }}>{heading}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
        {items.map((it) => (
          <li key={it.label} style={{ borderLeft: `2px solid ${ink}`, paddingLeft: 12 }}>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 12.5 }}>{it.label}</div>
            <div style={{ fontSize: 11.5, color: '#6B6B70', marginTop: 2 }}>{it.detail}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoiCard({ label, price, terms, featured }: { label: string; price: string; terms: string; featured?: boolean }) {
  return (
    <div style={{
      background: featured ? '#0A0A0B' : '#fff',
      color: featured ? '#fff' : 'inherit',
      border: featured ? '0.5px solid #0A0A0B' : '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 12,
      padding: 18,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5,
        letterSpacing: '0.1em',
        opacity: featured ? 0.7 : 0.5,
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'Sora, sans-serif',
        fontWeight: 800,
        fontSize: 26,
        letterSpacing: '-0.02em',
        marginBottom: 6,
      }}>{price}</div>
      <div style={{
        fontSize: 11,
        lineHeight: 1.5,
        opacity: featured ? 0.85 : 0.7,
      }}>{terms}</div>
    </div>
  );
}
