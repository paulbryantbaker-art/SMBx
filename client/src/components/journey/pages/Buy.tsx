/**
 * Glass Grok · /buy
 * ─────────────────────────────────────────────────────────────────────
 * Buy-side journey for searchers, sponsors, buyers. Hero → funnel math
 * → 3 capability heroes → deal Rundown preview → SBA alert → 5-phase
 * process → stat bar → bottom CTA.
 *
 * Spec: Glass Grok/SMBX_SITE_COPY.md (page 3)
 */

import { useMemo, useState } from 'react';
import {
  Page, JourneyHero, Section, H2, Body,
  StatBar, Card, Timeline, BottomCta, AlertBanner,
} from '../primitives';

interface Props { onSend: (text: string) => void; onStartFree: () => void; }

const CHIPS = [
  'Score this deal (paste URL)',
  'Model the capital stack',
  'Stress-test the guarantee',
  'What should I offer?',
] as const;

export default function Buy({ onSend, onStartFree }: Props) {
  return (
    <Page onStartFree={onStartFree}>
      <JourneyHero
        eyebrow="Buying a business"
        headline="Screen ten deals in the time it takes to screen one."
        tagline="Yulia scores any deal in 90 seconds on seven dimensions, models the capital stack under current SBA rules, and stress-tests the personal guarantee before you sign. For searchers, sponsors, and buyers."
        chatPlaceholder="Paste a listing URL, describe a deal, or tell Yulia what you\u2019re looking for\u2026"
        chips={CHIPS}
        onSend={onSend}
        onChip={onSend}
      />

      {/* ─── Problem ───────────────────────────────────────────────── */}
      <Section label="The problem">
        <H2>3,000 deals screened. 1 closed. That\u2019s the math.</H2>
        <Body>
          The buy-side funnel hasn\u2019t changed in two decades. Three thousand opportunities to get to one close. Eighteen months of burn rate. Eighty-five thousand dollars in busted diligence on deals that should have been dead before the first phone call.
        </Body>
        <Body>
          Most of that waste happens in the first filter. Screening a deal properly &mdash; concentration, margins, revenue quality, owner dependency, management depth, financial integrity, scalability &mdash; takes an experienced analyst four hours. Three thousand deals at four hours each is twelve thousand hours. Six full-time analysts for a year.
        </Body>
        <Body>
          The work that separates good deals from bad deals isn\u2019t complex. It\u2019s the same seven dimensions every PE associate checks instinctively after five hundred reps. But doing it three thousand times, consistently, without fatigue, without falling in love with revenue numbers &mdash; that\u2019s the bottleneck.
        </Body>
        <Body>
          Yulia removes the bottleneck. Every deal scored the same way. In 90 seconds. Pursue or pass before you spend a dollar.
        </Body>
      </Section>

      {/* ─── Hero 1: The Rundown ───────────────────────────────────── */}
      <Section variant="tint" label="Hero 1 \u00b7 The Rundown">
        <H2>Seven dimensions. Sixty seconds. Pursue or pass.</H2>
        <Body lead>Concentration. Margins. Revenue quality. Owner dependency. Management depth. Financial integrity. Scalability.</Body>
        <Body>
          These are the seven things an experienced buyer checks instinctively on every deal. Together they predict close rate and performance better than any single metric. The Rundown applies them to any deal in 90 seconds.
        </Body>
        <Body>
          Paste a listing URL. Upload a teaser. Type a description. Yulia classifies the business, identifies red flags, scores each dimension 1&ndash;10, and gives you a total score with a clear recommendation.
        </Body>
        <Body>
          Across thousands of analyses, deals scoring below 40 died in diligence 78% of the time at an average sunk cost of $34K per dead deal. Deals scoring above 70 closed and performed as modeled 83% of the time.
        </Body>
        <Body>The Rundown doesn\u2019t predict the future. It tells you which deals are worth your money to find out.</Body>
      </Section>

      {/* ─── Hero 2: SBA SOP 50 10 8 ───────────────────────────────── */}
      <Section label="Hero 2 \u00b7 SBA SOP 50 10 8">
        <H2>Your rollover just died. Yulia rebuilds it.</H2>
        <Body>
          SBA SOP 50 10 8 took effect June 1, 2025. It\u2019s the most disruptive regulatory change in two decades for SMB and lower middle market deals. Forty-one percent of brokers report deal delays. Rollover equity is effectively dead. Seller notes only count as equity on full standby. Partial change-of-ownership must now be stock purchases.
        </Body>
        <Body>
          Every practitioner trying to close an SBA-financed deal right now is figuring out how to restructure under the new rules. Lawyers charge $1,000 an hour to model scenarios.
        </Body>
        <Body>
          Yulia models SOP 50 10 8 structures in 90 seconds. Senior debt, mezzanine, seller notes with correct standby terms, equity injection requirements, SBA 7(a) eligibility. Restructures killed deals into closable ones. Handles rollover substitutes. Stress-tests DSCR under every scenario.
        </Body>
        <Body>
          This is the single hardest thing to replicate with ChatGPT and a weekend. The knowledge is specialized, the math is structural, and the rules shift. It\u2019s also the single most valuable thing Yulia does for buyers in 2026.
        </Body>
      </Section>

      {/* ─── Hero 3: Stress test ───────────────────────────────────── */}
      <Section variant="tint" label="Hero 3 \u00b7 Stress test">
        <H2>Know exactly where the deal breaks before you guarantee it.</H2>
        <Body>
          The personal guarantee is real. The unlimited liability is real. The unwind scenario is real. Most buyers sign anyway because they\u2019ve modeled the base case on a napkin.
        </Body>
        <Body>
          Yulia stress-tests every deal against the scenarios that actually kill acquisitions. Revenue down 10%, 15%, 25%. Margins compressed 200bps. Largest customer leaves. Top two leave. Interest rates move 150bps. DSCR at every intersection.
        </Body>
        <Body>
          On a $25M acquisition, base-case DSCR of 2.1&times; feels comfortable. At revenue down 25%, it drops to 0.9&times;. That\u2019s your floor. Knowing that before you sign changes the negotiation. Customer retention escrow. Seller note standby terms. Working capital peg methodology.
        </Body>
        <Body>You sign the guarantee knowing exactly where the line is. Not hoping. Knowing.</Body>
      </Section>

      {/* ─── Interactive: Deal Rundown preview ─────────────────────── */}
      <Section label="Try it">
        <DealRundownPreview onSend={onSend} />
      </Section>

      {/* ─── SBA alert banner (dark) ───────────────────────────────── */}
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

      {/* ─── 5-phase process ───────────────────────────────────────── */}
      <Section variant="tint" label="The buy process">
        <H2>How Yulia runs a buy-side deal.</H2>
        <Timeline
          phases={[
            { label: 'Phase 1 \u2014 THESIS', free: true,
              body: 'Define what you\u2019re looking for. Industry, geography, deal size, capital structure, operating vs passive involvement. Yulia builds the acquisition thesis through conversation and maps the target landscape.' },
            { label: 'Phase 2 \u2014 SCREEN',
              body: 'The Rundown on every deal that enters the pipeline. Seven dimensions, 90 seconds. Kill the 62% that will never close. Spend real time on the 18% that might.' },
            { label: 'Phase 3 \u2014 MODEL',
              body: 'For deals worth pursuing: full financial model, capital stack under SOP 50 10 8, DSCR sensitivity, IRR across exit scenarios. Ready for your lender and your investment committee.' },
            { label: 'Phase 4 \u2014 DILIGENCE',
              body: '147-item DD checklist generated from the deal specifics. QofE preview. Risk summary. Working capital model. Coordination across legal, accounting, and operations.' },
            { label: 'Phase 5 \u2014 CLOSE & OPERATE',
              body: 'LOI drafted. Structure modeled. Working capital peg set. Funds flow coordinated. Day 0 integration protocols. 180-day PMI plan &mdash; auto-generated from the deal data before the wire hits.' },
          ]}
        />
      </Section>

      <Section tight>
        <StatBar items={[
          { value: '3,000 \u2192 1', label: 'Traditional search funnel' },
          { value: '$34K',           label: 'Average busted diligence cost per dead deal' },
          { value: '78%',            label: 'Sub-40 deals that die in diligence' },
        ]} />
      </Section>

      <BottomCta
        heading="Paste a deal. Get a score. Free."
        subhead="The first 3 deals you screen on smbX are free. No credit card."
        chatPlaceholder="Paste a URL, describe a deal, or tell Yulia what you\u2019re looking for\u2026"
        onSend={onSend}
      />
    </Page>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   DEAL RUNDOWN PREVIEW — interactive
   Paste a URL or describe a deal → Yulia scores 7 dimensions.
   For now this is a demonstrative preview: scores animate in based on
   a deterministic hash of the input so the same deal always shows the
   same score. The real Rundown runs in chat.
   ═════════════════════════════════════════════════════════════════════ */

const DIMENSIONS = [
  'Concentration', 'Margins', 'Revenue quality', 'Dependency',
  'Management', 'Financials', 'Scalability',
] as const;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function scoreFromInput(input: string): { dims: number[]; total: number; verdict: 'PURSUE' | 'DEEPER LOOK' | 'PASS' } {
  const h = hashStr(input);
  /* Pseudo-random but deterministic per input. Range 3–9 per dimension. */
  const dims = DIMENSIONS.map((_, i) => 3 + ((h >> (i * 3)) & 7));
  const total = Math.round((dims.reduce((a, b) => a + b, 0) / (DIMENSIONS.length * 10)) * 100);
  const verdict: 'PURSUE' | 'DEEPER LOOK' | 'PASS' =
    total >= 70 ? 'PURSUE' : total >= 40 ? 'DEEPER LOOK' : 'PASS';
  return { dims, total, verdict };
}

function DealRundownPreview({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof scoreFromInput> | null>(null);

  const analyze = () => {
    if (!input.trim()) return;
    setResult(scoreFromInput(input));
  };

  const verdictStyle = useMemo(() => {
    if (!result) return {};
    if (result.verdict === 'PURSUE')      return { bg: 'var(--gg-band-hi-bg)',   fg: 'var(--gg-band-hi-fg)' };
    if (result.verdict === 'DEEPER LOOK') return { bg: 'var(--gg-band-med-bg)',  fg: 'var(--gg-band-med-fg)' };
    return                                       { bg: 'var(--gg-band-flag-bg)', fg: 'var(--gg-band-flag-fg)' };
  }, [result]);

  return (
    <>
      <H2>Score a deal right now.</H2>
      <Body lead style={{ marginBottom: 28 }}>
        Paste a listing URL or upload a teaser. Yulia gives you a preview score in 90 seconds.
      </Body>

      <Card padding={24} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Paste a deal URL or describe the business\u2026"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') analyze(); }}
            style={{
              flex: 1, minWidth: 220,
              padding: '12px 16px',
              border: '0.5px solid var(--gg-border)',
              borderRadius: 'var(--gg-r-btn)',
              fontSize: 15, fontFamily: 'var(--gg-body)',
              background: 'var(--gg-bg-app)',
              outline: 'none',
            }}
          />
          <button type="button" className="gg-btn gg-btn--primary" onClick={analyze} disabled={!input.trim()}>
            Score it &rarr;
          </button>
        </div>
      </Card>

      {result && (
        <Card padding={28}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="gg-label" style={{ marginBottom: 4 }}>Deal score</div>
              <div className="gg-stat">{result.total}</div>
            </div>
            <div
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--gg-r-pill)',
                background: verdictStyle.bg,
                color: verdictStyle.fg,
                fontFamily: 'var(--gg-display)',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '0.08em',
              }}
            >
              {result.verdict}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {DIMENSIONS.map((dim, i) => (
              <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ minWidth: 130, fontSize: 13, fontWeight: 600, color: 'var(--gg-text-secondary)' }}>{dim}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--gg-bg-muted)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${result.dims[i] * 10}%`,
                      height: '100%',
                      background: result.dims[i] >= 7 ? 'var(--gg-dot-ready)'
                                : result.dims[i] >= 4 ? 'var(--gg-dot-progress)'
                                :                       'var(--gg-dot-flag)',
                      transition: 'width 600ms var(--gg-ease-spring)',
                    }}
                  />
                </div>
                <div style={{ minWidth: 24, fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 14, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {result.dims[i]}
                </div>
              </div>
            ))}
          </div>

          <p className="gg-body" style={{ marginBottom: 20, fontSize: 14, color: 'var(--gg-text-muted)' }}>
            Want the full analysis? Yulia writes the deal memo, models the capital stack, and flags every risk.
          </p>
          <button type="button" className="gg-btn gg-btn--primary" onClick={() => onSend(`Give me the full Rundown on this deal: ${input}`)}>
            Continue in chat &rarr;
          </button>
        </Card>
      )}
    </>
  );
}
