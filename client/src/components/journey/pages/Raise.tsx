/**
 * Glass Grok · /raise (desktop rebuild)
 * ─────────────────────────────────────────────────────────────────────
 * Reframe page: 6 capital-structure alternatives to a full sale.
 * Hero 2-col (3-path preview right), 6-structure grid, Sell-vs-Raise
 * calc, 3 zigzag capability heroes, dark bottom CTA.
 *
 * Spec: SMBX_SITE_COPY.md (page 4) + desktop spec.
 */

import { useMemo, useState } from 'react';
import {
  Page, JourneyHero, Section, H2, Body,
  Card, BottomCta, SectionNav,
  type JourneyTab,
} from '../primitives';

interface Props { onSend: (text: string) => void; onStartFree: () => void; onNavigate?: (d: JourneyTab) => void; }

const CHIPS = [
  'Sell or raise?',
  'Model a minority equity raise',
  'ESOP feasibility',
  'How much capital can I raise?',
] as const;

const STRUCTURES = [
  { title: 'Majority Sale with Rollover',
    body: 'Sell 51–80%. Significant cash now, rollover equity for the second bite. Common PE structure. Best for owners ready to step back but believe in the next 3–5 years of growth.',
    typical: '15–30% rollover, 5–7× multiple on majority sold' },
  { title: 'Minority Equity Raise',
    body: 'Sell 20–40% to a growth investor. Access capital. Retain control. Stay as CEO.',
    typical: '$5M–$25M raised, investor gets board seat, no operational control' },
  { title: 'ESOP',
    body: 'Sell to your employees. Strong tax benefits via Section 1042 (S-Corp rollover). Preserves culture. Owner stays as chairman typically 3–5 years.',
    typical: '70–80% of fair market value, repurchase obligation over 10 years' },
  { title: 'Mezzanine Debt',
    body: 'Junior debt with equity kicker (warrants). Access $5M–$30M without selling equity. Repay over 5–7 years.',
    typical: '12–14% rate, 2–5% warrants, no dilution if repaid before warrants exercise' },
  { title: 'Convertible Note',
    body: 'Capital that converts to equity at a future valuation event. Dilution deferred. Often used when current valuation is contested.',
    typical: '6–10% interest, conversion cap, 18–24 month maturity' },
  { title: 'Dividend Recapitalization',
    body: 'Lever the business with debt, pay yourself a dividend. Retain 100% equity. Business services the debt.',
    typical: '$10M–$50M distributed, 4–6× EBITDA leverage, 5–7 year term' },
];

const SECNAV = [
  { id: 'the-reframe',                     label: 'Reframe' },
  { id: 'the-6-structures',                label: 'Structures' },
  { id: 'sell-vs-raise',                   label: 'Sell vs raise' },
  { id: 'hero-1-structure-modeling',       label: 'Modeling' },
  { id: 'hero-2-pitch-deck-data-room',     label: 'Pitch deck' },
  { id: 'hero-3-investor-targeting',       label: 'Investors' },
];

export default function Raise({ onSend, onStartFree, onNavigate }: Props) {
  return (
    <Page active="raise" onNavigate={onNavigate} onStartFree={onStartFree}>
      <SectionNav items={SECNAV} />
      <JourneyHero
        eyebrow="Raising capital"
        headline="You don’t have to sell 100% to get liquidity."
        tagline="Yulia models every capital structure — minority equity, ESOP, mezzanine, convertible, recap — against your specific numbers. Builds the investor materials. Targets the right capital partners. In one conversation."
        chatPlaceholder="Tell Yulia about your business and what you’re trying to accomplish…"
        chips={CHIPS}
        onSend={onSend}
        onChip={onSend}
        rightPanel={<StructurePreview />}
      />

      {/* Reframe */}
      <Section variant="tint" label="The reframe">
        <H2>Most advisors default to &ldquo;sell.&rdquo; That’s not always the answer.</H2>
        <div className="gg-two-col" style={{ marginTop: 48, alignItems: 'start' }}>
          <div>
            <Body>Selling 100% is one option. It’s also the option most advisors pitch first &mdash; because it generates the largest one-time fee. That doesn’t make it wrong. It just makes it one of several.</Body>
            <Body>Sell 30% to a PE firm at 6&times; and take $15M off the table. Stay in the operator seat. In 3–5 years, you exit the remaining 70% at a higher multiple &mdash; a second bite that’s often larger than the first.</Body>
            <Body>Run an ESOP. Sell to your employees with significant tax advantages under Section 1042. Keep your culture. Stay as chairman.</Body>
          </div>
          <div>
            <Body>Take $20M in a dividend recap. Keep 100% equity. Leverage the business to deliver personal liquidity without changing who owns it.</Body>
            <Body>These aren’t exotic structures. They’re standard tools used every day by sophisticated operators. Most owners never hear about them because they never ask someone who isn’t paid on the full-exit transaction.</Body>
            <Body><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 600 }}>Yulia has no fee incentive.</strong> She models every path against your specific numbers. You decide which one fits.</Body>
          </div>
        </div>
      </Section>

      {/* 6 structures — two featured + four alternatives, same pattern
          as /sell exit paths. Majority Rollover + Minority Equity are
          the two most common paths; others are alternatives. */}
      <Section label="The 6 structures">
        <H2>Six ways to get liquidity without losing your business.</H2>
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          {STRUCTURES.map((s, i) => {
            const featured = i < 2;
            return (
              <Card
                key={s.title}
                padding={featured ? 32 : 22}
                style={{
                  gridColumn: featured ? 'span 2' : 'span 1',
                  borderColor: featured ? 'var(--gg-text-primary)' : undefined,
                }}
              >
                {featured && (
                  <div className="gg-label" style={{ marginBottom: 10, fontSize: 10 }}>Most common</div>
                )}
                <h3 className="gg-h3" style={{ fontSize: featured ? 20 : 16, marginBottom: 10 }}>{s.title}</h3>
                <p className="gg-body" style={{ fontSize: featured ? 14 : 13, marginBottom: 14 }}>{s.body}</p>
                <div style={{
                  fontFamily: 'var(--gg-display)', fontWeight: 600, fontSize: 11,
                  color: 'var(--gg-text-muted)', letterSpacing: '0.02em',
                  paddingTop: 14,
                  borderTop: '0.5px dashed var(--gg-border)',
                }}>
                  Typical: {s.typical}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Interactive Sell-vs-Raise */}
      <Section variant="tint" label="Sell vs Raise">
        <SellVsRaise onSend={onSend} />
      </Section>

      {/* Hero 1 Structure modeling — 55/45 text, fan escapes right */}
      <Section label="Hero 1 · Structure modeling">
        <div className="gg-two-col gg-two-col--55-45" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">Every capital structure, modeled in ten minutes.</H2>
            <Body>Your advisor showed you one option. Yulia shows you six &mdash; with the math on each.</Body>
            <Body>Full sale at 6&times;. Minority equity at 6&times; with 30% sold. ESOP with 1042 rollover. Mezzanine with warrant coverage. Convertible note with cap and floor. Dividend recap at 4.5&times; leverage.</Body>
            <Body>Each structure modeled with after-tax proceeds, retained ownership, ongoing cash flow, tax treatment, board implications, and exit scenarios at year 3, 5, and 7.</Body>
            <Body><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>Side by side. Same financials. Radically different outcomes.</strong></Body>
          </div>
          <div>
            <StructureFan />
          </div>
        </div>
      </Section>

      {/* Hero 2 Pitch deck — 40/60 mockup dominant, reversed */}
      <Section variant="tint" label="Hero 2 · Pitch deck + data room">
        <div className="gg-two-col gg-two-col--40-60 gg-two-col--reverse" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">Investor-ready materials in hours, not weeks.</H2>
            <Body>Capital raises live or die on the materials. The pitch deck is the first impression. The data room is where deals close. Both need to be right.</Body>
            <Body>Yulia generates the complete raise package from your financials and a 15-minute conversation. 22-slide pitch deck with market sizing, financial projections, cap table, use of proceeds, investor return scenarios, and competitive positioning.</Body>
            <Body>Data room organized with every document a professional investor expects: historical financials, customer cohort analysis, contracts summary, employee agreements, cap table, legal structure, IP register.</Body>
            <Body>Not a template. Built from your specific business, market, and ask.</Body>
          </div>
          <div>
            <PitchDeckMock />
          </div>
        </div>
      </Section>

      {/* Hero 3 Investor targeting — 55/45 text */}
      <Section label="Hero 3 · Investor targeting">
        <div className="gg-two-col gg-two-col--55-45" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">Not every investor fits every deal.</H2>
            <Body>A growth equity firm looking for 40% YoY revenue growth is the wrong investor for a steady 12% grower. A PE firm that only buys majority stakes is wrong for a minority raise. A mezz lender is wrong for a company that can’t service 14% coupon debt.</Body>
            <Body>Yulia maps the investor universe against your specific deal. Growth equity, lower middle market PE, family offices direct-investing, mezzanine lenders, SBIC funds. Each scored on thesis alignment with your business size, stage, growth profile, and capital structure needs.</Body>
            <Body><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>You contact the ones that fit.</strong> Skip the meetings with the ones that don’t.</Body>
          </div>
          <div>
            <InvestorMap />
          </div>
        </div>
      </Section>

      <BottomCta
        heading="Not every liquidity event is a sale."
        subhead="Tell Yulia what you’re trying to accomplish. She’ll show you every path."
        chatPlaceholder="I want liquidity but I’m not sure I want to sell entirely…"
        onSend={onSend}
      />
    </Page>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   STRUCTURE PREVIEW — hero rightPanel (3 paths stacked with after-tax)
   ═════════════════════════════════════════════════════════════════════ */

function StructurePreview() {
  const rows: { label: string; detail: string; total: string; winner?: boolean }[] = [
    { label: 'Full sale',       detail: '100% out · clean break',          total: '$22.9M after-tax' },
    { label: 'Minority raise',  detail: '30% sold · exit 70% in 5y',       total: '$29.4M after-tax',  winner: true },
    { label: 'Dividend recap',  detail: '100% equity · leverage 4.5×', total: '$18.4M today + cashflow' },
  ];
  return (
    <Card padding={28} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>Three paths · same business</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>$5M EBITDA</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: r.winner ? 'var(--gg-accent)' : 'var(--gg-bg-subtle)',
              color: r.winner ? '#fff' : 'var(--gg-text-primary)',
              border: '0.5px solid var(--gg-border)',
              borderColor: r.winner ? 'var(--gg-accent)' : 'var(--gg-border)',
              boxShadow: r.winner ? 'inset 0 0.5px 0 rgba(255,255,255,0.12)' : undefined,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 13, letterSpacing: '-0.005em' }}>{r.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{r.detail}</div>
              </div>
              <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>{r.total}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--gg-bg-app)', borderRadius: 10, fontSize: 12, color: 'var(--gg-text-muted)', lineHeight: 1.55 }}>
        <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 600 }}>Yulia’s take:</strong> Minority raise wins by $6.5M after-tax &mdash; but you keep operating for another 5 years.
      </div>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   STRUCTURE FAN — Hero 1 visual (6 outcome tiles in a staggered fan)
   ═════════════════════════════════════════════════════════════════════ */

function StructureFan() {
  const paths: { label: string; total: string; accent?: boolean }[] = [
    { label: 'Full sale',         total: '$22.9M' },
    { label: 'Majority rollover', total: '$24.1M' },
    { label: 'Minority raise',    total: '$29.4M', accent: true },
    { label: 'ESOP',              total: '$16.8M' },
    { label: 'Mezzanine',         total: '$20.4M' },
    { label: 'Dividend recap',    total: '$18.4M' },
  ];
  return (
    <Card padding={28} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>Six paths · after-tax</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>5y horizon</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {paths.map((p, i) => (
          <div
            key={i}
            style={{
              padding: '14px 14px',
              borderRadius: 10,
              background: p.accent ? 'var(--gg-accent)' : 'var(--gg-bg-subtle)',
              color: p.accent ? '#fff' : 'var(--gg-text-primary)',
              border: '0.5px solid',
              borderColor: p.accent ? 'var(--gg-accent)' : 'var(--gg-border)',
              boxShadow: p.accent ? 'inset 0 0.5px 0 rgba(255,255,255,0.12)' : undefined,
            }}
          >
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>{p.label}</div>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.015em', fontVariantNumeric: 'tabular-nums' }}>{p.total}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   PITCH DECK MOCK — Hero 2 visual (stacked deck slides)
   ═════════════════════════════════════════════════════════════════════ */

function PitchDeckMock() {
  const slides = [
    { n: '01', t: 'Cover'             },
    { n: '02', t: 'Market'            },
    { n: '03', t: 'Product'           },
    { n: '04', t: 'Traction'          },
    { n: '05', t: 'Financials'        },
    { n: '06', t: 'Use of proceeds'   },
    { n: '07', t: 'Cap table'         },
    { n: '22', t: 'Ask'               },
  ];
  return (
    <Card padding={28} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>Pitch deck · 22 slides</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Series A · ready</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {slides.map(s => (
          <div key={s.n} style={{
            aspectRatio: '4 / 3',
            background: 'var(--gg-bg-subtle)',
            border: '0.5px solid var(--gg-border)',
            borderRadius: 6,
            padding: '8px 10px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 8.5, color: 'var(--gg-text-muted)', letterSpacing: '0.1em' }}>{s.n}</div>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10.5, color: 'var(--gg-text-primary)' }}>{s.t}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--gg-bg-app)', borderRadius: 8, fontSize: 11.5, color: 'var(--gg-text-muted)', lineHeight: 1.55 }}>
        Data room: 127 documents, 14 categories, indexed and cross-referenced.
      </div>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   INVESTOR MAP — Hero 3 visual (5 investor types with alignment bars)
   ═════════════════════════════════════════════════════════════════════ */

function InvestorMap() {
  const types: { type: string; thesis: string; score: number }[] = [
    { type: 'Growth equity',    thesis: '40%+ YoY growth',            score: 20 },
    { type: 'LMM PE',           thesis: 'Stable cash, bolt-on thesis', score: 92 },
    { type: 'Family office',    thesis: 'Patient capital, minority',   score: 78 },
    { type: 'Mezzanine',        thesis: 'Debt + warrants',             score: 55 },
    { type: 'SBIC',             thesis: 'SBA-eligible LBO',            score: 35 },
  ];
  return (
    <Card padding={28} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>Thesis fit</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>5 categories</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {types.map(t => (
          <div key={t.type}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <div>
                <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 13, letterSpacing: '-0.005em' }}>{t.type}</div>
                <div style={{ fontSize: 11, color: 'var(--gg-text-muted)', marginTop: 2 }}>{t.thesis}</div>
              </div>
              <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{t.score}</div>
            </div>
            <div style={{ height: 6, background: 'var(--gg-bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${t.score}%`, height: '100%', background: t.score >= 70 ? 'var(--gg-dot-ready)' : t.score >= 40 ? 'var(--gg-dot-progress)' : 'var(--gg-text-muted)' }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   SELL VS RAISE — interactive calculator
   ═════════════════════════════════════════════════════════════════════ */

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n.toFixed(0)}`;
}

const TAX_LT_GAINS = 0.238;
const SALE_MULTIPLE = 6;
const GROWTH_RATE = 0.08;

function SellVsRaise({ onSend }: { onSend: (text: string) => void }) {
  const [ebitda, setEbitda] = useState(5);
  const [years, setYears] = useState<3 | 5 | 7 | 10>(5);
  const [ownership, setOwnership] = useState(100);

  const result = useMemo(() => {
    const ebitdaUSD = ebitda * 1_000_000;
    const enterpriseNow = ebitdaUSD * SALE_MULTIPLE;
    const ownerShareNow = enterpriseNow * (ownership / 100);
    const fullSaleAfterTax = ownerShareNow * (1 - TAX_LT_GAINS);

    const minorityPctSold = 0.30;
    const minorityProceedsNow = enterpriseNow * minorityPctSold;
    const minorityAfterTaxNow = minorityProceedsNow * (1 - TAX_LT_GAINS);
    const remainingPct = (ownership / 100) * (1 - minorityPctSold);
    const ebitdaAtExit = ebitdaUSD * Math.pow(1 + GROWTH_RATE, years);
    const enterpriseAtExit = ebitdaAtExit * SALE_MULTIPLE;
    const exitProceeds = enterpriseAtExit * remainingPct;
    const exitAfterTax = exitProceeds * (1 - TAX_LT_GAINS);
    const minorityTotal = minorityAfterTaxNow + exitAfterTax;

    return {
      fullSaleAfterTax, fullGross: ownerShareNow,
      minorityNow: minorityAfterTaxNow, minorityExit: exitAfterTax, minorityTotal,
      delta: minorityTotal - fullSaleAfterTax,
    };
  }, [ebitda, years, ownership]);

  const sendToYulia = () => {
    onSend(`Run the full sell-vs-raise comparison for me. EBITDA $${ebitda}M, ${years}-year horizon, current ownership ${ownership}%.`);
  };

  return (
    <>
      <H2>Run the comparison yourself.</H2>
      <p className="gg-body--sub" style={{ marginBottom: 40 }}>
        Input your numbers. Yulia shows you what each path actually puts in your pocket.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 900, marginBottom: 32 }}>
        <SliderInput label="Annual EBITDA" display={`$${ebitda}M`} min={1} max={50} step={1} value={ebitda} onChange={setEbitda} />
        <div>
          <div className="gg-label" style={{ marginBottom: 10 }}>Years until full exit</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([3, 5, 7, 10] as const).map(y => (
              <button key={y} type="button" className={`gg-chip${y === years ? ' active' : ''}`} aria-pressed={y === years} onClick={() => setYears(y)}>
                {y}y
              </button>
            ))}
          </div>
        </div>
        <SliderInput label="Current ownership" display={`${ownership}%`} min={25} max={100} step={5} value={ownership} onChange={setOwnership} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Card padding={28}>
          <div className="gg-label" style={{ marginBottom: 8 }}>Full Sale (today)</div>
          <div className="gg-stat" style={{ marginBottom: 8, fontSize: 'clamp(36px, 4vw, 48px)' }}>{fmt(result.fullSaleAfterTax)}</div>
          <p className="gg-body" style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--gg-text-muted)' }}>
            Gross {fmt(result.fullGross)} · after-tax (23.8%)
          </p>
          <p className="gg-body" style={{ margin: 0, fontSize: 13, color: 'var(--gg-text-secondary)' }}>You exit. Clean break.</p>
        </Card>
        <Card padding={28}>
          <div className="gg-label" style={{ marginBottom: 8 }}>Minority Raise (today + {years}y)</div>
          <div className="gg-stat" style={{ marginBottom: 8, fontSize: 'clamp(36px, 4vw, 48px)' }}>{fmt(result.minorityTotal)}</div>
          <p className="gg-body" style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--gg-text-muted)' }}>
            {fmt(result.minorityNow)} now + {fmt(result.minorityExit)} at exit
          </p>
          <p className="gg-body" style={{ margin: 0, fontSize: 13, color: 'var(--gg-text-secondary)' }}>You keep operating. Potential upside.</p>
        </Card>
      </div>

      <div style={{
        marginTop: 24, padding: 20,
        border: '0.5px solid var(--gg-border)',
        borderRadius: 14,
        background: result.delta > 0 ? 'var(--gg-band-hi-bg)' : 'var(--gg-band-low-bg)',
      }}>
        <div style={{
          fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: result.delta > 0 ? 'var(--gg-band-hi-fg)' : 'var(--gg-band-low-fg)',
        }}>
          {result.delta > 0 ? 'Minority raise wins by' : 'Full sale wins by'}
        </div>
        <div style={{
          fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 36,
          color: result.delta > 0 ? 'var(--gg-band-hi-fg)' : 'var(--gg-band-low-fg)',
          marginTop: 6, fontVariantNumeric: 'tabular-nums',
        }}>
          {fmt(Math.abs(result.delta))}
        </div>
      </div>

      <p className="gg-body" style={{ marginTop: 24, fontSize: 13, color: 'var(--gg-text-muted)', maxWidth: 760 }}>
        Simplified preview. 6&times; exit multiple, 8% EBITDA growth, 23.8% LTCG + NIIT. Nominal dollars &mdash; no discounting, no transaction costs, no rollover equity modeled.
      </p>
      <button type="button" className="gg-btn gg-btn--primary" onClick={sendToYulia} style={{ marginTop: 12 }}>
        Get the full analysis &rarr;
      </button>
    </>
  );
}

function SliderInput({ label, display, min, max, step, value, onChange }: {
  label: string; display: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="gg-label">{label}</span>
        <span style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 18, color: 'var(--gg-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {display}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--gg-accent)' }}
      />
    </div>
  );
}
