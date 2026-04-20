/**
 * Glass Grok v2 · Raise.tsx — merged SITE_COPY April 2026 + MedCorp
 * walkthrough.
 *
 * 7 sections: hero → reframe → 6 liquidity structures → MedCorp
 * 5-structure math table → interactive sell-vs-raise → cap stack →
 * deck → investor map.
 */
import { useMemo, useState } from 'react';
import {
  DealStep, DealBench, Row, DealBottom,
  type DealTab, type DealStepScript,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
import InteractiveTool from '../shell/InteractiveTool';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const CHIPS = ['Sell or raise?', 'ESOP feasibility', 'How much can I raise?', 'Draft my deck'] as const;

type StructureRow = {
  label: string; cash: string; retained: string; upside: string; control: string;
  variant?: 'default' | 'alt' | 'featured';
};
const STRUCTURES: readonly StructureRow[] = [
  { label: 'Full sale',           cash: '$105M', retained: '0%',   upside: '—',        control: 'None',      variant: 'default' },
  { label: 'Majority recap',      cash: '$73M',  retained: '30%',  upside: '+$58M',    control: 'Board seat', variant: 'alt' },
  { label: 'Minority recap ★',    cash: '$42M',  retained: '70%',  upside: '+$134M',   control: 'Full',      variant: 'featured' },
  { label: 'Preferred + PIK',     cash: '$35M',  retained: '100%', upside: '+$118M',   control: 'Full',      variant: 'default' },
  { label: 'Senior-stretch debt', cash: '$28M',  retained: '100%', upside: '+$142M',   control: 'Full',      variant: 'alt' },
];

type LiquidityCard = { n: string; title: string; body: string; typical?: string };
const LIQUIDITY: readonly LiquidityCard[] = [
  { n: '01', title: 'Majority Sale with Rollover', body: 'Sell 51–80%. Significant cash now, rollover equity for the second bite. Common PE structure.',       typical: '15–30% rollover, 5–7× multiple' },
  { n: '02', title: 'Minority Equity Raise',       body: 'Sell 20–40% to a growth investor. Access capital, retain control, stay as CEO.',                       typical: '$5–25M raised, board seat only' },
  { n: '03', title: 'ESOP',                        body: 'Sell to your employees. Strong Section 1042 tax benefits. Preserves culture. Owner often stays as chairman 3–5 years.', typical: '70–80% of FMV, 10yr repurchase' },
  { n: '04', title: 'Mezzanine Debt',              body: 'Junior debt with equity kicker (warrants). $5–30M without selling equity. Repay over 5–7 years.',        typical: '12–14% rate, 2–5% warrants' },
  { n: '05', title: 'Convertible Note',            body: 'Capital that converts to equity at a future valuation event. Dilution deferred. Used when valuation is contested.', typical: '6–10% interest, 18–24mo maturity' },
  { n: '06', title: 'Dividend Recapitalization',   body: 'Lever the business with debt, pay yourself a dividend. Retain 100% equity. Business services the debt.', typical: '$10–50M distributed, 4–6× EBITDA' },
];

const SCRIPT: DealStepScript = {
  3: [
    { who: 'y', text: 'At $14M EBITDA × 7.5× you\'re a $105M business. Full sale nets that today. Minority recap nets $42M today and leaves you 70% of the next bite — at P50 that\'s <strong>+$134M</strong> over 5 years.' },
  ],
  5: [
    { who: 'y', text: 'Stack sized for <strong>$140M EV</strong>: $42M sponsor + $20M pref + $56M unitranche + $22M ABL. Leverage lands at 4.3× net. Stressed a 25% EBITDA dip — FCCV holds at 1.08×.' },
  ],
  6: [
    { who: 'y', text: '22 slides written in IC voice. Three to rehearse first: <strong>thesis, unit economics, use of proceeds</strong>. Most founders over-explain slide 1 and rush slide 14 — it\'s the opposite of what the room wants.' },
  ],
  7: [
    { who: 'y', text: '23 firms fit. 6 tier-1. Kepler is top — 9 specialty services deals in 3 years and you have a warm intro through J. Chen.' },
  ],
};

export default function Raise({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      chat={{
        title: 'Yulia',
        status: 'Sizing a growth round',
        script: SCRIPT,
        opening: "Hi — I'm <strong>Yulia</strong>. This walkthrough is a $14M EBITDA owner deciding between a full sale, a minority recap, and three other paths. Scroll to watch me run the math.",
        reply: 'Three inputs: <strong>EBITDA</strong>, <strong>cash needed out</strong>, and <strong>whether you want to keep running it</strong>. I\'ll run all six structures against your numbers.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Hero */}
      <DealStep
        n={1}
        id="s1"
        idx="Raise"
        title="You don't have to sell 100% to get liquidity."
        lede={<>Yulia models every capital structure — minority equity, ESOP, mezzanine, convertible, recap — against your specific numbers. Builds the investor materials. Targets the right capital partners. In one conversation.</>}
      />

      {/* Reframe */}
      <DealStep
        n={2}
        id="s2"
        idx="The reframe"
        title="Most advisors default to 'sell.' That's not always the answer."
        lede={<>Selling 100% is one option. It\'s also the option most advisors pitch first — because it generates the largest one-time fee. Yulia has no fee incentive. She models every path against your specific numbers. You decide which one fits.</>}
      />

      {/* 6 liquidity structures */}
      <DealStep
        n={3}
        id="s3"
        idx="Six paths"
        title="Six ways to get liquidity without losing your business."
      >
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}>
          {LIQUIDITY.map((c) => (
            <div key={c.n} style={{
              background: '#fff',
              border: '0.5px solid rgba(0,0,0,0.08)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
                color: '#9A9A9F',
                textTransform: 'uppercase',
              }}>{c.n}</div>
              <div style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '-0.015em',
                color: '#0A0A0B',
              }}>{c.title}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#3A3A3E' }}>{c.body}</div>
              {c.typical && (
                <div style={{
                  marginTop: 'auto',
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: '#6B6B70',
                  textTransform: 'uppercase',
                  paddingTop: 8,
                  borderTop: '0.5px solid rgba(0,0,0,0.06)',
                }}>Typical · {c.typical}</div>
              )}
            </div>
          ))}
        </div>
      </DealStep>

      {/* Structure comparison (MedCorp) */}
      <DealStep
        n={4}
        id="s4"
        idx="The math · MedCorp"
        title="Same company. Different structures. Radically different outcomes."
        lede={<>A $14M EBITDA business modeled at a 7.5× multiple. Full sale today vs. five other structures. The retained equity in a minority recap compounds into the largest total outcome over five years.</>}
      >
        <DealBench title="Structure comparison · MedCorp · $14M EBITDA" meta="MODELED @ 7.5× MULT">
          <div style={{ padding: 22 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 9.5, letterSpacing: '0.1em', color: '#9A9A9F', textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600 }}>Structure</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>Cash today</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>Retained</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>5yr upside (P50)</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {STRUCTURES.map((r, i) => {
                  const bg = r.variant === 'featured' ? '#0A0A0B' : r.variant === 'alt' ? '#FAFAFB' : undefined;
                  const color = r.variant === 'featured' ? '#fff' : undefined;
                  const upsideColor = r.variant === 'featured' ? '#7ED8A1' : (r.upside.startsWith('+') ? '#22A755' : '#9A9A9F');
                  return (
                    <tr key={i} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', background: bg, color }}>
                      <td style={{ padding: '14px 10px', fontWeight: r.variant === 'featured' ? 700 : 600 }}>{r.label}</td>
                      <td style={{ textAlign: 'right', padding: '14px 10px', fontVariantNumeric: 'tabular-nums' }}>{r.cash}</td>
                      <td style={{ textAlign: 'right', padding: '14px 10px', fontVariantNumeric: 'tabular-nums', color: r.retained === '0%' ? '#9A9A9F' : undefined }}>{r.retained}</td>
                      <td style={{ textAlign: 'right', padding: '14px 10px', fontVariantNumeric: 'tabular-nums', color: r.upside === '—' ? '#9A9A9F' : upsideColor }}>{r.upside}</td>
                      <td style={{ textAlign: 'right', padding: '14px 10px', color: r.control === 'None' ? '#9A9A9F' : undefined }}>{r.control}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 22px', background: '#FAFAFB', borderTop: '0.5px solid rgba(0,0,0,0.06)', fontSize: 12.5, color: '#3A3A3E', lineHeight: 1.55 }}>
            <strong style={{ color: '#0A0A0B' }}>Yulia\'s take:</strong> Minority recap gets you a second bite ~3× the first. The premium for full sale over minority today is only $63M — your retained 70% is worth $94M at entry and $134M at P50 exit.
          </div>
        </DealBench>
      </DealStep>

      {/* Interactive sell-vs-raise */}
      <DealStep
        n={5}
        id="s5"
        idx="Run your numbers"
        title="Full sale vs. minority raise — over 5 years."
        lede={<>Simple comparison here — real analysis includes after-tax math and control trade-offs.</>}
      >
        <InteractiveTool
          kicker="Sell vs. raise calculator"
          sub="Drag the sliders. See what each path puts in your pocket."
        >
          <SellVsRaise />
        </InteractiveTool>
      </DealStep>

      {/* Cap stack */}
      <DealStep
        n={6}
        id="s6"
        idx="Cap stack"
        title="Sized to the deal. Not to what one lender will lend you."
        lede={<>The right stack stretches your equity without forcing a covenant reset every 18 months. Yulia builds three layers, models cash-on-cash for each, and stress-tests against a 25% EBITDA dip.</>}
      >
        <DealBench title="Capital stack · Recommended" meta="$140M ENTERPRISE VALUE">
          <div style={{ padding: '26px 22px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 10, overflow: 'hidden' }}>
              <StackLayer bg="#0A0A0B" fg="#fff" title="Sponsor equity"  sub="LP check · 5yr hold target"          amt="$42M" pct="30%" />
              <StackLayer bg="#3A3A3E" fg="#fff" title="Preferred equity" sub="12% PIK · no maintenance covs"       amt="$20M" pct="14%" />
              <StackLayer bg="#7A7A80" fg="#fff" title="Unitranche"       sub="SOFR + 575 · 1.25× FCCV"             amt="$56M" pct="40%" />
              <StackLayer bg="#C8C8CC" fg="#0A0A0B" title="ABL revolver"  sub="$22M committed · $12M drawn"         amt="$22M" pct="16%" />
            </div>
          </div>
          <div style={{ padding: '14px 22px', background: '#FAFAFB', borderTop: '0.5px solid rgba(0,0,0,0.06)', fontSize: 12.5, color: '#3A3A3E', lineHeight: 1.55 }}>
            <strong style={{ color: '#0A0A0B' }}>Stress test:</strong> 25% EBITDA dip year 2 — FCCV holds at 1.08×, no covenant breach. Same deal with all-senior at 4.5× levers would breach in month 14.
          </div>
        </DealBench>
      </DealStep>

      {/* Deck */}
      <DealStep
        n={7}
        id="s7"
        idx="Pitch deck"
        title="Investor-ready materials in hours, not weeks."
        lede={<>22 slides. Written in the voice of a Lazard MD, not a SaaS founder. Yulia frames the business the way an IC reads it — thesis, moat, unit economics, use of proceeds, returns, risks and mitigants.</>}
      >
        <DealBench title="Investor deck · Project Spring" meta="22 SLIDES · v3" bodyStyle={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 22, background: '#FAFAFB' }}>
          <DeckSlide idx="01 · Thesis" title="Consolidating a fragmented, recurring-revenue specialty services market." />
          <DeckSlide idx="08 · Unit economics" title="68% gross margin · 14-mo payback · 132% NRR.">
            <div style={{ display: 'flex', gap: 4, alignItems: 'end', marginTop: 10, height: 28 }}>
              {[40, 55, 70, 85, 100].map((h) => <div key={h} style={{ width: 8, height: `${h}%`, background: '#0A0A0B' }} />)}
            </div>
          </DeckSlide>
          <DeckSlide idx="14 · Use of proceeds" title="$62M roll-up capital · $18M platform tech · $20M WC.">
            <div style={{ display: 'flex', height: 6, marginTop: 12, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ flex: 62, background: '#0A0A0B' }} />
              <div style={{ flex: 18, background: '#3A3A3E' }} />
              <div style={{ flex: 20, background: '#7A7A80' }} />
            </div>
          </DeckSlide>
        </DealBench>
      </DealStep>

      {/* Investors */}
      <DealStep
        n={8}
        id="s8"
        idx="Investor map"
        title="Not every investor fits every deal."
        lede={<>A growth equity firm looking for 40% YoY growth is wrong for a 12% grower. A PE firm that only buys majority stakes is wrong for a minority raise. Yulia maps the universe against your deal and scores each on thesis alignment.</>}
      >
        <DealBench title="Investor map · Growth equity · Specialty services" meta="23 FITS · 6 TIER-1" bodyStyle={{ padding: '0 22px 22px' }}>
          <Row title="Kepler Growth Partners" sub="$40–80M · 9 services deals last 3yrs · warm intro via J. Chen"     amt={<span style={{ fontSize: 15 }}>Fit 96</span>} />
          <Row title="Meridian Capital"       sub="$25–60M · sector specialist · known for minority recaps"           amt={<span style={{ fontSize: 15 }}>Fit 92</span>} />
          <Row title="Halcyon Partners"       sub="$30–70M · operator-led · close rate 42% on sourced deals"          amt={<span style={{ fontSize: 15 }}>Fit 89</span>} />
          <Row title="+ 20 more qualified"    sub="Ranked by thesis fit × close rate × cycle timing"                   amt={<span style={{ fontSize: 15 }}>View all</span>} highlight />
        </DealBench>
      </DealStep>

      <DealBottom
        heading="Not every liquidity event is a sale."
        sub="Tell Yulia what you're trying to accomplish. She'll show you every path."
        placeholder="I want liquidity but I'm not sure I want to sell entirely…"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

function SellVsRaise() {
  const [ebitda, setEbitda] = useState(14);
  const [years, setYears] = useState(5);
  const multiple = 7.5;
  const growthPa = 0.12;
  const ev = ebitda * multiple;
  const fullSale = ev;
  const minorityToday = ev * 0.3;
  const futureEv = ebitda * Math.pow(1 + growthPa, years) * multiple;
  const minorityFuture = futureEv * 0.7;
  const minorityTotal = minorityToday + minorityFuture;

  return (
    <div style={{
      marginTop: 18,
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 14,
      padding: 22,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 18,
      }}>
        <Slider label={`Annual EBITDA · $${ebitda}M`}  min={5} max={50} value={ebitda} onChange={setEbitda} step={1} />
        <Slider label={`Years to full exit · ${years}`} min={3} max={10} value={years} onChange={setYears} step={1} />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        <ResultCard
          heading="Full sale today"
          lines={[
            { label: 'Enterprise value', value: `$${fullSale.toFixed(0)}M` },
            { label: 'Gross proceeds',   value: `$${fullSale.toFixed(0)}M` },
            { label: `In ${years} years`, value: '—', muted: true },
          ]}
          footer="Clean break. Tax event today."
        />
        <ResultCard
          heading="Minority raise · 30% today"
          accent
          lines={[
            { label: 'Cash today',      value: `$${minorityToday.toFixed(0)}M` },
            { label: `Retained 70% in ${years}yrs`, value: `$${minorityFuture.toFixed(0)}M` },
            { label: 'Total',           value: `$${minorityTotal.toFixed(0)}M`, emphasize: true },
          ]}
          footer={`Assumes ${Math.round(growthPa * 100)}% EBITDA CAGR at ${multiple}× exit multiple.`}
        />
      </div>
      <div style={{
        marginTop: 14,
        fontSize: 11.5,
        color: '#6B6B70',
        lineHeight: 1.5,
      }}>
        Simple pre-tax comparison. Yulia models all six structures with after-tax math, ownership implications, and control trade-offs.
      </div>
    </div>
  );
}

function Slider({ label, min, max, value, onChange, step = 1 }: {
  label: string; min: number; max: number; value: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#6B6B70',
        marginBottom: 8,
      }}>{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#0A0A0B' }}
      />
    </div>
  );
}

function ResultCard({ heading, lines, footer, accent }: {
  heading: string;
  lines: { label: string; value: string; emphasize?: boolean; muted?: boolean }[];
  footer: string;
  accent?: boolean;
}) {
  return (
    <div style={{
      background: accent ? '#0A0A0B' : '#FAFAFB',
      color: accent ? '#fff' : 'inherit',
      borderRadius: 12,
      padding: 18,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: 0.65,
        marginBottom: 12,
      }}>{heading}</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {lines.map((l) => (
          <div key={l.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            fontSize: l.emphasize ? 15 : 13,
            fontWeight: l.emphasize ? 700 : 500,
            opacity: l.muted ? 0.5 : 1,
          }}>
            <span>{l.label}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{l.value}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12,
        paddingTop: 10,
        borderTop: accent ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
        fontSize: 11,
        opacity: 0.7,
      }}>{footer}</div>
    </div>
  );
}

function StackLayer({ bg, fg, title, sub, amt, pct }: {
  bg: string; fg: string; title: string; sub: string; amt: string; pct: string;
}) {
  const opacityBase = fg === '#fff' ? 0.7 : 0.7;
  return (
    <div style={{ background: bg, color: fg, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 11, opacity: opacityBase, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 22 }}>{amt}</div>
        <div style={{ fontSize: 10, opacity: 0.6, fontFamily: 'JetBrains Mono, ui-monospace, monospace', letterSpacing: '0.1em' }}>{pct}</div>
      </div>
    </div>
  );
}

function DeckSlide({ idx, title, children }: { idx: string; title: string; children?: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 16, aspectRatio: '16/10' }}>
      <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 9, letterSpacing: '0.1em', color: '#9A9A9F', marginBottom: 8 }}>{idx}</div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>{title}</div>
      {children ?? (
        <>
          <div style={{ height: 3, width: '80%', background: '#E8E8EB', borderRadius: 2, marginTop: 10 }} />
          <div style={{ height: 3, width: '60%', background: '#E8E8EB', borderRadius: 2, marginTop: 5 }} />
        </>
      )}
    </div>
  );
}

/* useMemo kept reachable for future computed summary rendering */
void useMemo;
