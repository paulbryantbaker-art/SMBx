/**
 * Glass Grok v2 · Raise.tsx
 * 4 steps: structure comparison → cap stack → deck → investor map.
 * Port of new_journey/project/raise.html.
 */
import {
  DealRoomPage, DealStep, DealBench, Row, DealBottom,
  type DealTab, type DealStepScript,
} from '../deal-room';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const SECTION_NAV = [
  { id: 's1', label: 'Structure' },
  { id: 's2', label: 'Cap stack' },
  { id: 's3', label: 'Deck' },
  { id: 's4', label: 'Investors' },
] as const;

const CHIPS = ['Sale vs minority?', 'Size my round', 'Draft my deck', 'Who invests in us?'] as const;

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

const SCRIPT: DealStepScript = {
  1: [
    { who: 'y', text: 'At $14M EBITDA × 7.5× you’re a $105M business. Full sale nets that today. Minority recap nets $42M today and leaves you 70% of the next bite.' },
    { who: 'me', text: 'How big is the second bite?' },
    { who: 'y', text: 'At base case <strong>+$134M</strong> over 5 years. Aggressive gets you to ~$180M. The math favors minority unless you need all the liquidity now.' },
  ],
  2: [
    { who: 'y', text: 'Stack is sized for <strong>$140M EV</strong>: $42M sponsor + $20M pref + $56M unitranche + $22M ABL. Leverage lands at 4.3× net.' },
    { who: 'y', text: 'Stress-tested a 25% EBITDA dip — FCCV holds at 1.08×. All-senior at the same leverage would breach in year two.' },
  ],
  3: [
    { who: 'y', text: 'Deck is 22 slides, written in IC voice. The three I’d walk first: <strong>thesis, unit economics, use of proceeds</strong>.' },
    { who: 'y', text: 'Want me to draft the verbal for each? Most founders over-explain slide 1 and rush slide 14 — it’s usually the opposite of what the room wants.' },
  ],
  4: [
    { who: 'y', text: '23 firms match. 6 tier-1. Kepler is the top fit — they closed 9 specialty services deals in 3 years and you have a warm intro through J. Chen.' },
    { who: 'y', text: 'I can draft the outreach and sequence the pitches. First meetings usually within two weeks.' },
  ],
};

export default function Raise({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  return (
    <DealRoomPage
      active={active}
      sectionNav={SECTION_NAV}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      rail={{
        name: 'Yulia',
        status: 'Sizing a growth round',
        script: SCRIPT,
        opening: 'Hi — I’m <strong>Yulia</strong>. This walkthrough is a $14M EBITDA owner deciding between a full sale and a minority recap. Scroll to watch me run the math.',
        reply: 'Three inputs: <strong>EBITDA</strong>, <strong>how much cash you need out</strong>, and <strong>whether you want to keep running it</strong>. I’ll run all five structures against your numbers.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* Step 01 · Structure comparison */}
      <DealStep
        n={1}
        id="s1"
        idx="Step 01 · Structure"
        title="You probably don’t need to sell the whole thing."
        lede={<>Most owners default to a full sale because that’s the option a broker offers. Yulia runs five structures side-by-side — full sale, minority recap, majority recap, preferred with PIK, senior-stretch debt — and shows you what each one means for your equity, your control, and your 5-year upside.</>}
      >
        <DealBench title="Structure comparison · MedCorp · $14M EBITDA" meta="MODELED @ 7.5× MULT">
          <div style={{ padding: 22 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 9.5, letterSpacing: '0.1em', color: '#9A9A9F', textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600 }}>Structure</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>Cash today</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>Retained equity</th>
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
          <FlagStrip>
            <strong style={{ color: '#0A0A0B' }}>Yulia’s take:</strong> Minority recap gets you a second bite ~3× the first. The premium for full sale over minority today is only $63M — your retained 70% is worth $94M at entry and $134M at P50 exit.
          </FlagStrip>
        </DealBench>
      </DealStep>

      {/* Step 02 · Cap stack */}
      <DealStep
        n={2}
        id="s2"
        idx="Step 02 · Cap stack"
        title="Sized to the deal. Not to what one lender will lend you."
        lede={<>The right stack stretches your equity without forcing a covenant reset every 18 months. Yulia builds three layers — senior, unitranche, preferred equity — models the cash-on-cash return for each, and stress-tests against a 25% EBITDA dip.</>}
      >
        <DealBench title="Capital stack · Recommended" meta="$140M ENTERPRISE VALUE">
          <div style={{ padding: '26px 22px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 10, overflow: 'hidden' }}>
              <StackLayer bg="#0A0A0B" fg="#fff" title="Sponsor equity" sub="LP check · 5yr hold target" amt="$42M" pct="30%" />
              <StackLayer bg="#3A3A3E" fg="#fff" title="Preferred equity" sub="12% PIK · no maintenance covs" amt="$20M" pct="14%" />
              <StackLayer bg="#7A7A80" fg="#fff" title="Unitranche" sub="SOFR + 575 · 1.25× FCCV" amt="$56M" pct="40%" />
              <StackLayer bg="#C8C8CC" fg="#0A0A0B" title="ABL revolver" sub="$22M committed · $12M drawn" amt="$22M" pct="16%" />
            </div>
          </div>
          <FlagStrip>
            <strong style={{ color: '#0A0A0B' }}>Stress test:</strong> 25% EBITDA dip year 2 — FCCV holds at 1.08×, no covenant breach. Same deal with all-senior at 4.5× levers would breach in month 14.
          </FlagStrip>
        </DealBench>
      </DealStep>

      {/* Step 03 · Deck */}
      <DealStep
        n={3}
        id="s3"
        idx="Step 03 · Deck"
        title="A pitch that gets taken seriously. Not a template."
        lede={<>22 slides. Written in the voice of a Lazard MD, not a SaaS founder. Yulia pulls your numbers into a narrative that frames the business the way an IC reads — thesis, moat, unit economics, use of proceeds, return model, risks and mitigants.</>}
      >
        <DealBench title="Investor deck · Project Spring" meta="22 SLIDES · v3" bodyStyle={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 22, background: '#FAFAFB' }}>
          <DeckSlide idx="01 · Thesis" title="Consolidating a fragmented, recurring-revenue specialty services market." />
          <DeckSlide idx="08 · Unit economics" title="68% gross margin · 14-mo payback · 132% NRR.">
            <div style={{ display: 'flex', gap: 4, alignItems: 'end', marginTop: 10, height: 28 }}>
              {[40, 55, 70, 85, 100].map(h => (
                <div key={h} style={{ width: 8, height: `${h}%`, background: '#0A0A0B' }} />
              ))}
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

      {/* Step 04 · Investors */}
      <DealStep
        n={4}
        id="s4"
        idx="Step 04 · Investors"
        title="The 23 firms that actually write this check. Not 200."
        lede={<>Yulia maps every fund with an active thesis that matches your sector, stage, and check size — filters out the ones currently deploying elsewhere or off-cycle — and ranks them by historical close rate for deals in your shape.</>}
      >
        <DealBench title="Investor map · Growth equity · Specialty services" meta="23 FITS · 6 TIER-1" bodyStyle={{ padding: '0 22px 22px' }}>
          <Row title="Kepler Growth Partners" sub="$40–80M checks · 9 services deals last 3yrs · warm intro via J. Chen" amt={<span style={{ fontSize: 15 }}>Fit 96</span>} />
          <Row title="Meridian Capital" sub="$25–60M · sector specialist · known for minority recaps" amt={<span style={{ fontSize: 15 }}>Fit 92</span>} />
          <Row title="Halcyon Partners" sub="$30–70M · operator-led · close rate 42% on sourced deals" amt={<span style={{ fontSize: 15 }}>Fit 89</span>} />
          <Row title="+ 20 more qualified" sub="Ranked by thesis fit × close rate × cycle timing" amt={<span style={{ fontSize: 15 }}>View all</span>} highlight />
        </DealBench>
      </DealStep>

      <DealBottom
        heading="Tell Yulia your raise goal. See which structure fits before you pick the advisor."
        sub="EBITDA, how much cash you need, whether you want to stay. She returns a five-structure comparison and an investor shortlist in under an hour."
        placeholder="EBITDA, cash need, ownership preference…"
        onSend={onSend}
      />
    </DealRoomPage>
  );
}

/* ─── page-local atoms ─── */

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

function FlagStrip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 22px', background: '#FAFAFB', borderTop: '0.5px solid rgba(0,0,0,0.06)', fontSize: 12.5, color: '#3A3A3E', lineHeight: 1.55 }}>
      {children}
    </div>
  );
}
