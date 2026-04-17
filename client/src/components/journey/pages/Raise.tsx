/**
 * Glass Grok · /raise
 * ─────────────────────────────────────────────────────────────────────
 * Reframes "sell" into six capital structures. Hero → reframe → 6
 * structure cards → interactive Sell-vs-Raise calc → 3 capability
 * heroes → bottom CTA.
 *
 * Spec: Glass Grok/SMBX_SITE_COPY.md (page 4)
 */

import { useMemo, useState } from 'react';
import {
  Page, JourneyHero, Section, H2, Body,
  Card, CardGrid, BottomCta,
} from '../primitives';

interface Props { onSend: (text: string) => void; onStartFree: () => void; }

const CHIPS = [
  'Sell or raise?',
  'Model a minority equity raise',
  'ESOP feasibility',
  'How much capital can I raise?',
] as const;

export default function Raise({ onSend, onStartFree }: Props) {
  return (
    <Page onStartFree={onStartFree}>
      <JourneyHero
        eyebrow="Raising capital"
        headline="You don\u2019t have to sell 100% to get liquidity."
        tagline="Yulia models every capital structure \u2014 minority equity, ESOP, mezzanine, convertible, recap \u2014 against your specific numbers. Builds the investor materials. Targets the right capital partners. In one conversation."
        chatPlaceholder="Tell Yulia about your business and what you\u2019re trying to accomplish\u2026"
        chips={CHIPS}
        onSend={onSend}
        onChip={onSend}
      />

      {/* ─── The reframe ───────────────────────────────────────────── */}
      <Section label="The reframe">
        <H2>Most advisors default to &ldquo;sell.&rdquo; That\u2019s not always the answer.</H2>
        <Body>
          Selling 100% is one option. It\u2019s also the option most advisors pitch first &mdash; because it generates the largest one-time fee. That doesn\u2019t make it wrong. It just makes it one of several.
        </Body>
        <Body>Consider the alternatives:</Body>
        <Body>
          Sell 30% to a PE firm at 6&times; and take $15M off the table. Stay in the operator seat. The business keeps growing. In 3&ndash;5 years, you exit the remaining 70% at a higher multiple &mdash; a second bite that\u2019s often larger than the first.
        </Body>
        <Body>
          Run an ESOP. Sell to your employees with significant tax advantages under Section 1042. Keep your culture. Stay as chairman.
        </Body>
        <Body>
          Take $20M in a dividend recap. Keep 100% equity. Leverage the business to deliver personal liquidity without changing who owns it.
        </Body>
        <Body>
          These aren\u2019t exotic structures. They\u2019re standard tools used every day by sophisticated operators. Most owners never hear about them because they never ask someone who isn\u2019t paid on the full-exit transaction.
        </Body>
        <Body>
          Yulia has no fee incentive. She models every path against your specific numbers. You decide which one fits.
        </Body>
      </Section>

      {/* ─── 6 structures ──────────────────────────────────────────── */}
      <Section variant="tint" label="The 6 structures">
        <H2>Six ways to get liquidity without losing your business.</H2>
        <div style={{ marginBottom: 28 }} />
        <CardGrid minCol={280}>
          {STRUCTURES.map(s => (
            <Card key={s.title}>
              <h3 className="gg-h3" style={{ marginBottom: 8 }}>{s.title}</h3>
              <p className="gg-body" style={{ marginBottom: 10, fontSize: 14 }}>{s.body}</p>
              <p style={{
                margin: 0, fontFamily: 'var(--gg-display)', fontWeight: 600, fontSize: 11,
                color: 'var(--gg-text-muted)', letterSpacing: '0.02em',
              }}>
                <em style={{ fontStyle: 'normal' }}>Typical: {s.typical}</em>
              </p>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ─── Interactive: Sell vs Raise ────────────────────────────── */}
      <Section label="Sell vs Raise">
        <SellVsRaise onSend={onSend} />
      </Section>

      {/* ─── Hero 1: Structure modeling ────────────────────────────── */}
      <Section variant="tint" label="Hero 1 \u00b7 Structure modeling">
        <H2>Every capital structure, modeled in ten minutes.</H2>
        <Body>Your advisor showed you one option. Yulia shows you six &mdash; with the math on each.</Body>
        <Body>
          Full sale at 6&times;. Minority equity at 6&times; with 30% sold. ESOP with 1042 rollover. Mezzanine with warrant coverage. Convertible note with cap and floor. Dividend recap at 4.5&times; leverage.
        </Body>
        <Body>
          Each structure modeled with after-tax proceeds, retained ownership, ongoing cash flow, tax treatment, board implications, and exit scenarios at year 3, 5, and 7.
        </Body>
        <Body>Side by side. Same financials. Radically different outcomes.</Body>
        <Body>
          Most owners had never considered more than one. After seeing all six, they often choose differently than they would have.
        </Body>
      </Section>

      {/* ─── Hero 2: Pitch deck + data room ────────────────────────── */}
      <Section label="Hero 2 \u00b7 Pitch deck + data room">
        <H2>Investor-ready materials in hours, not weeks.</H2>
        <Body>Capital raises live or die on the materials. The pitch deck is the first impression. The data room is where deals close. Both need to be right.</Body>
        <Body>
          Yulia generates the complete raise package from your financials and a 15-minute conversation. 22-slide pitch deck with market sizing, financial projections, cap table, use of proceeds, investor return scenarios, and competitive positioning.
        </Body>
        <Body>
          Data room organized with every document a professional investor expects: historical financials, customer cohort analysis, contracts summary, employee agreements, cap table, legal structure, intellectual property register.
        </Body>
        <Body>Not a template. Built from your specific business, market, and ask.</Body>
      </Section>

      {/* ─── Hero 3: Investor targeting ────────────────────────────── */}
      <Section variant="tint" label="Hero 3 \u00b7 Investor targeting">
        <H2>Not every investor fits every deal.</H2>
        <Body>
          A growth equity firm looking for 40% year-over-year revenue growth is the wrong investor for a steady 12% grower. A PE firm that only buys majority stakes is the wrong investor for a minority raise. A mezzanine lender is wrong for a company that can\u2019t service 14% coupon debt.
        </Body>
        <Body>
          Yulia maps the investor universe against your specific deal. Growth equity, lower middle market PE, family offices direct-investing, mezzanine lenders, SBIC funds. Each scored on thesis alignment with your business size, stage, growth profile, and capital structure needs.
        </Body>
        <Body>You contact the ones that fit. Skip the meetings with the ones that don\u2019t.</Body>
      </Section>

      <BottomCta
        heading="Not every liquidity event is a sale."
        subhead="Tell Yulia what you\u2019re trying to accomplish. She\u2019ll show you every path."
        chatPlaceholder="I want liquidity but I\u2019m not sure I want to sell entirely\u2026"
        onSend={onSend}
      />
    </Page>
  );
}

const STRUCTURES = [
  { title: 'Majority Sale with Rollover',
    body: 'Sell 51\u201380%. Significant cash now, rollover equity for the second bite. Common PE structure. Best for owners ready to step back but believe in the next 3\u20135 years of growth.',
    typical: '15\u201330% rollover, 5\u20137\u00d7 multiple on majority sold' },
  { title: 'Minority Equity Raise',
    body: 'Sell 20\u201340% to a growth investor. Access capital. Retain control. Stay as CEO.',
    typical: '$5M\u2013$25M raised, investor gets board seat, no operational control' },
  { title: 'ESOP',
    body: 'Sell to your employees. Strong tax benefits via Section 1042 (S-Corp rollover). Preserves culture. Owner stays as chairman typically 3\u20135 years.',
    typical: '70\u201380% of fair market value, repurchase obligation over 10 years' },
  { title: 'Mezzanine Debt',
    body: 'Junior debt with equity kicker (warrants). Access $5M\u2013$30M without selling equity. Repay over 5\u20137 years.',
    typical: '12\u201314% rate, 2\u20135% warrants, no dilution if repaid before warrants exercise' },
  { title: 'Convertible Note',
    body: 'Capital that converts to equity at a future valuation event. Dilution deferred. Often used when current valuation is contested.',
    typical: '6\u201310% interest, conversion cap, 18\u201324 month maturity' },
  { title: 'Dividend Recapitalization',
    body: 'Lever the business with debt, pay yourself a dividend. Retain 100% equity. Business services the debt.',
    typical: '$10M\u2013$50M distributed, 4\u20136\u00d7 EBITDA leverage, 5\u20137 year term' },
];

/* ═════════════════════════════════════════════════════════════════════
   SELL VS RAISE — interactive
   Shows the after-tax 5-year outcome of full sale vs minority raise.
   Simplified math: long-term cap-gains 20% + 3.8% NIIT on sale proceeds.
   ═════════════════════════════════════════════════════════════════════ */

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n.toFixed(0)}`;
}

const TAX_LT_GAINS = 0.238;      /* 20% + 3.8% NIIT */
const SALE_MULTIPLE = 6;
const GROWTH_RATE = 0.08;        /* 8% EBITDA growth/yr — LMM base case. */

function SellVsRaise({ onSend }: { onSend: (text: string) => void }) {
  const [ebitda, setEbitda] = useState(5);          /* in $M */
  const [years, setYears] = useState<3 | 5 | 7 | 10>(5);
  const [ownership, setOwnership] = useState(100);  /* current %, base 100 */

  const result = useMemo(() => {
    const ebitdaUSD = ebitda * 1_000_000;
    const enterpriseNow = ebitdaUSD * SALE_MULTIPLE;
    const ownerShareNow = enterpriseNow * (ownership / 100);
    const fullSaleAfterTax = ownerShareNow * (1 - TAX_LT_GAINS);

    /* Minority raise: sell 30% now, exit remaining ownership * 0.7 in `years` */
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
      fullSaleAfterTax,
      fullGross: ownerShareNow,
      minorityNow: minorityAfterTaxNow,
      minorityNowGross: minorityProceedsNow,
      minorityExit: exitAfterTax,
      minorityTotal,
      delta: minorityTotal - fullSaleAfterTax,
    };
  }, [ebitda, years, ownership]);

  const sendToYulia = () => {
    onSend(`Run the full sell-vs-raise comparison for me. EBITDA $${ebitda}M, ${years}-year horizon, current ownership ${ownership}%.`);
  };

  return (
    <>
      <H2>Run the comparison yourself.</H2>
      <Body lead style={{ marginBottom: 28 }}>
        Input your numbers. Yulia shows you what each path actually puts in your pocket over 5 years.
      </Body>

      <div style={{ display: 'grid', gap: 20, maxWidth: 720, marginBottom: 28 }}>
        <SliderInput
          label="Annual EBITDA"
          display={`$${ebitda}M`}
          min={1} max={50} step={1} value={ebitda}
          onChange={setEbitda}
        />
        <div>
          <div className="gg-label" style={{ marginBottom: 10 }}>Years until full exit</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([3, 5, 7, 10] as const).map(y => (
              <button
                key={y}
                type="button"
                className={`gg-chip${y === years ? ' active' : ''}`}
                aria-pressed={y === years}
                onClick={() => setYears(y)}
              >
                {y} years
              </button>
            ))}
          </div>
        </div>
        <SliderInput
          label="Current ownership"
          display={`${ownership}%`}
          min={25} max={100} step={5} value={ownership}
          onChange={setOwnership}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Card padding={24} style={{ background: 'var(--gg-bg-app)' }}>
          <div className="gg-label" style={{ marginBottom: 8 }}>Full Sale (today)</div>
          <div className="gg-stat" style={{ marginBottom: 4 }}>{fmt(result.fullSaleAfterTax)}</div>
          <p className="gg-body" style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--gg-text-muted)' }}>
            Gross {fmt(result.fullGross)} &middot; after-tax (23.8%)
          </p>
          <p className="gg-body" style={{ margin: 0, fontSize: 13, color: 'var(--gg-text-secondary)' }}>
            You exit. Clean break.
          </p>
        </Card>
        <Card padding={24} style={{ background: 'var(--gg-bg-app)' }}>
          <div className="gg-label" style={{ marginBottom: 8 }}>
            Minority Raise (today + {years} years)
          </div>
          <div className="gg-stat" style={{ marginBottom: 4 }}>{fmt(result.minorityTotal)}</div>
          <p className="gg-body" style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--gg-text-muted)' }}>
            {fmt(result.minorityNow)} now + {fmt(result.minorityExit)} at exit
          </p>
          <p className="gg-body" style={{ margin: 0, fontSize: 13, color: 'var(--gg-text-secondary)' }}>
            You keep operating. Potential upside.
          </p>
        </Card>
      </div>

      <div style={{ marginTop: 28, padding: 20, border: '0.5px solid var(--gg-border)', borderRadius: 'var(--gg-r-card-s)', background: result.delta > 0 ? 'var(--gg-band-hi-bg)' : 'var(--gg-band-low-bg)' }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: result.delta > 0 ? 'var(--gg-band-hi-fg)' : 'var(--gg-band-low-fg)' }}>
          {result.delta > 0 ? 'Minority raise wins by' : 'Full sale wins by'}
        </div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 28, color: result.delta > 0 ? 'var(--gg-band-hi-fg)' : 'var(--gg-band-low-fg)', marginTop: 4 }}>
          {fmt(Math.abs(result.delta))}
        </div>
      </div>

      <p className="gg-body" style={{ marginTop: 24, fontSize: 13, color: 'var(--gg-text-muted)' }}>
        Simplified preview. 6&times; exit multiple, 8% EBITDA growth, 23.8% LTCG + NIIT. Nominal dollars \u2014 no discounting, no transaction costs, no rollover equity modeled. Yulia\u2019s real analysis uses your financials, realistic growth, and all six structures.
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
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--gg-accent)',
        }}
      />
    </div>
  );
}
