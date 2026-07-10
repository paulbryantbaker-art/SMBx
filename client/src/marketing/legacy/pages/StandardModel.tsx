import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { MarketingShell } from '../MarketingShell';
import { enterApp } from '../useEnterApp';
import { ProvenanceSeal } from '../components/ProvenanceSeal';

const INPUTS = [
  'Current assets included (AR, inventory, prepaids)',
  'Current liabilities included (AP, accruals)',
  'Excluded items (cash, debt, related-party balances)',
  'Reference period (typically trailing 12-month average)',
];

const AUTHORITIES = [
  'ASC 210 — balance sheet classification',
  'Customary M&A practice on cash-free / debt-free transactions',
  'Linked authority register entries',
];

/* The worked example's opening position. Liabilities carry `neg` and render in
   accountant parentheses. NWC = 486,200 — asserted in
   scripts/marketing-math-reconcile.ts so the live exhibit always reconciles. */
const SCHEDULE_LINES: Array<{ line: string; amount: number; neg?: boolean }> = [
  { line: 'Accounts receivable', amount: 412_000 },
  { line: 'Inventory', amount: 188_400 },
  { line: 'Prepaids', amount: 42_000 },
  { line: 'Accounts payable', amount: 118_200, neg: true },
  { line: 'Accrued liabilities', amount: 38_000, neg: true },
];
const DELIVERED_DEFAULT = 501_900;

const fmtUSD = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString()}`;
const fmtSigned = (n: number) => `${n < 0 ? '−' : '+'}$${Math.round(Math.abs(n)).toLocaleString()}`;

/** An editable mono amount cell: parse on blur/Enter, clamp, reformat. */
function AmountCell({ value, neg, onCommit, label }: {
  value: number;
  neg?: boolean;
  onCommit: (n: number) => void;
  label: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const commit = () => {
    const el = ref.current;
    if (!el) return;
    const parsed = parseFloat((el.textContent || '').replace(/[^0-9.]/g, ''));
    const next = Number.isFinite(parsed) ? Math.min(99_999_999, Math.max(0, Math.round(parsed))) : value;
    onCommit(next);
    el.textContent = neg ? `$(${next.toLocaleString()})` : `$${next.toLocaleString()}`;
  };
  return (
    <span
      ref={ref}
      className="lg-input mono num"
      contentEditable
      suppressContentEditableWarning
      inputMode="numeric"
      role="textbox"
      aria-label={`${label} — editable`}
      spellCheck={false}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLSpanElement).blur(); } }}
    >
      {neg ? `$(${value.toLocaleString()})` : `$${value.toLocaleString()}`}
    </span>
  );
}

/**
 * LiveSchedule — the Working Paper move: the spec's worked example EXECUTES.
 * Type a new receivables number and the NWC, the peg, and the purchase-price
 * adjustment recompute on commit; the seal re-digests. The page is a working
 * instance of its own methodology.
 */
function LiveSchedule() {
  const [lines, setLines] = useState(SCHEDULE_LINES.map(l => l.amount));
  const [delivered, setDelivered] = useState(DELIVERED_DEFAULT);

  const nwc = SCHEDULE_LINES.reduce(
    (sum, l, i) => sum + (l.neg ? -lines[i] : lines[i]),
    0,
  );
  const peg = nwc; // illustrative: the trailing 12-mo average equals this position
  const adj = delivered - peg;

  return (
    <div className="sched" style={{ maxWidth: '64ch', marginTop: 6 }}>
      <div className="sched-hd">
        <span className="sched-no">Schedule 4.7 — Net working capital</span>
        <span className="sched-sub">live · edit any amount</span>
      </div>
      <div className="sched-body">
        <table className="ledger" aria-label="Net working capital schedule — amounts are editable">
          <tbody>
            {SCHEDULE_LINES.map((l, i) => (
              <tr key={l.line} className="lg-row">
                <td className="lg-label">{l.line}</td>
                <td className="lg-amt">
                  <AmountCell
                    value={lines[i]}
                    neg={l.neg}
                    label={l.line}
                    onCommit={(n) => setLines(arr => arr.map((v, j) => (j === i ? n : v)))}
                  />
                </td>
              </tr>
            ))}
            <tr className="lg-total">
              <td className="lg-label rule-over">Net working capital</td>
              <td className="lg-amt rule-over rule-double-under num">{fmtUSD(nwc)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 16 }}>
          <div className="kv">
            <span className="k">Peg (12-mo avg)</span>
            <span className="v">{fmtUSD(peg)}</span>
          </div>
          <div className="kv">
            <span className="k">Delivered NWC at close</span>
            <span className="v">
              <AmountCell value={delivered} label="Delivered NWC at close" onCommit={setDelivered} />
            </span>
          </div>
          <div className="kv">
            <span className="k">Purchase-price adjustment</span>
            <span className={adj >= 0 ? 'v pos' : 'v'} style={adj < 0 ? { color: 'var(--neg)' } : undefined}>
              {fmtSigned(adj)}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <ProvenanceSeal
            inputs={{ model: 'nwc_peg_schedule', lines, delivered }}
            modelId="MODEL.STRUCT.NWC.PEG.v1"
            note="computed in your browser just now"
          />
        </div>
      </div>
    </div>
  );
}

export default function StandardModel() {
  return (
    <MarketingShell>
      <section>
        <div className="wrap">
          {/* breadcrumb */}
          <div className="reveal mono" style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginBottom: 18 }}>
            <Link href="/standard" className="link-arrow" style={{ border: 0, padding: 0 }}>The Standard</Link>
            {' / Working capital / '}
            <span style={{ color: 'var(--ink)' }}>Working capital peg</span>
          </div>

          <div className="std-doc" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 56, alignItems: 'start' }}>
            {/* main column */}
            <div className="reveal">
              <h1 className="display" style={{ fontSize: 'clamp(2.6rem,4.2vw,3.8rem)', marginBottom: 18 }}>
                Working capital peg
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--ink-2)', maxWidth: '64ch' }}>
                The target level of net working capital a buyer expects to be
                delivered at close. The difference between the peg and actual
                delivered working capital adjusts the purchase price dollar for
                dollar.
              </p>

              <h2>When it matters</h2>
              <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
                Set during structuring (B4 / S3), trued up at close (B5 / S5). Gets
                contentious when the business is seasonal or working-capital-intensive.
              </p>

              <h2>Inputs</h2>
              <ul className="doc-list">
                {INPUTS.map(i => <li key={i}>{i}</li>)}
              </ul>

              <h2>Computation</h2>
              <pre className="mono" style={{ background: 'var(--dk)', color: '#fff', borderRadius: 12, padding: '22px 24px', fontSize: '.92rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxWidth: '64ch', margin: '6px 0 12px' }}>
<span style={{ color: 'rgba(255,255,255,.4)' }}># net working capital</span>{'\n'}
NWC = included current assets − included current liabilities{'\n'}
{'\n'}
<span style={{ color: 'rgba(255,255,255,.4)' }}># the peg</span>{'\n'}
Peg = average NWC over the reference period{'\n'}
{'\n'}
<span style={{ color: 'rgba(255,255,255,.4)' }}># purchase-price adjustment</span>{'\n'}
Adj = delivered NWC − Peg{'\n'}
{'      '}<span style={{ color: 'var(--accent)' }}>(+)</span> buyer pays more{'\n'}
{'      '}<span style={{ color: 'var(--accent)' }}>(−)</span> buyer pays less
              </pre>

              <h2>Controlling authorities &amp; conventions</h2>
              <ul className="doc-list">
                {AUTHORITIES.map(a => <li key={a}>{a}</li>)}
              </ul>

              <h2>Worked example</h2>
              <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
                Trailing-12-month reference period, cash-free / debt-free basis.
                The schedule below is live — change any amount and the peg and
                purchase-price adjustment recompute.
              </p>
              <LiveSchedule />

              {/* THE LINE note */}
              <div style={{ background: 'var(--accent-soft)', borderRadius: 12, padding: '20px 22px', maxWidth: '64ch', marginTop: 28 }}>
                <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent-strong)', marginBottom: 8 }}>
                  The line
                </div>
                <p style={{ margin: 0, color: 'var(--ink)' }}>
                  This is a computation method, not accounting or legal advice. The
                  treatment of specific items is a judgment for your accountant and counsel.
                </p>
              </div>
            </div>

            {/* sticky rail */}
            <aside className="reveal" data-d="1">
              <div className="std-rail" style={{ position: 'sticky', top: 92, background: 'var(--surface-2)', borderRadius: 14, padding: 24 }}>
                <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>
                  Methodology version
                </div>
                <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 500, marginBottom: 18 }}>v2.4</div>
                <button className="btn btn-accent" onClick={() => enterApp()} style={{ width: '100%', marginBottom: 10 }}>
                  Generate a working capital peg for your deal
                </button>
                <Link href="/standard" className="btn btn-ghost" style={{ width: '100%' }}>Back to the Standard</Link>
                <div className="mono" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: '.74rem', color: 'var(--ink-3)', lineHeight: 1.6 }}>
                  On this page<br />
                  <span style={{ color: 'var(--ink-2)' }}>When it matters · Inputs · Computation · Authorities · Worked example</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
