import { type CSSProperties } from 'react';
import { Link } from 'wouter';
import { MarketingShell } from '../MarketingShell';
import { enterApp } from '../useEnterApp';

/* KV row helper — mirrors the Home.tsx pattern; `.kv .v` is already mono */
function KV({ k, v, pos }: { k: string; v: string; pos?: boolean }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className={pos ? 'v pos' : 'v'}>{v}</span>
    </div>
  );
}

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

const EXAMPLE_LINES: Array<{ line: string; amount: string }> = [
  { line: 'Accounts receivable', amount: '$412,000' },
  { line: 'Inventory', amount: '$188,400' },
  { line: 'Prepaids', amount: '$42,000' },
  { line: 'Accounts payable', amount: '$(118,200)' },
  { line: 'Accrued liabilities', amount: '$(38,000)' },
];

/* page-local list style — matches CD's .doc ul (diamond marker, ruled rows) */
const listStyle: CSSProperties = { margin: '0 0 12px', padding: 0, listStyle: 'none', maxWidth: '64ch' };
const liStyle: CSSProperties = { padding: '8px 0 8px 22px', position: 'relative', color: 'var(--ink-2)', borderBottom: '1px solid var(--line)' };

function Diamond() {
  return <span style={{ position: 'absolute', left: 2, top: 15, width: 6, height: 6, background: 'var(--accent)', transform: 'rotate(45deg)' }} />;
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
              <h1 className="display" style={{ fontSize: 'clamp(2rem,3.6vw,3rem)', marginBottom: 14 }}>
                Working capital peg
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--ink-2)', maxWidth: '64ch' }}>
                The target level of net working capital a buyer expects to be
                delivered at close. The difference between the peg and actual
                delivered working capital adjusts the purchase price dollar for
                dollar.
              </p>

              <h2 style={{ fontSize: '1.5rem', margin: '42px 0 14px' }}>When it matters</h2>
              <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
                Set during structuring (B4 / S3), trued up at close (B5 / S5). Gets
                contentious when the business is seasonal or working-capital-intensive.
              </p>

              <h2 style={{ fontSize: '1.5rem', margin: '42px 0 14px' }}>Inputs</h2>
              <ul style={listStyle}>
                {INPUTS.map(i => <li key={i} style={liStyle}><Diamond />{i}</li>)}
              </ul>

              <h2 style={{ fontSize: '1.5rem', margin: '42px 0 14px' }}>Computation</h2>
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

              <h2 style={{ fontSize: '1.5rem', margin: '42px 0 14px' }}>Controlling authorities &amp; conventions</h2>
              <ul style={listStyle}>
                {AUTHORITIES.map(a => <li key={a} style={liStyle}><Diamond />{a}</li>)}
              </ul>

              <h2 style={{ fontSize: '1.5rem', margin: '42px 0 14px' }}>Worked example</h2>
              <p style={{ color: 'var(--ink-2)', maxWidth: '64ch' }}>
                Trailing-12-month reference period, cash-free / debt-free basis.
              </p>
              <div className="mock" style={{ maxWidth: '64ch', marginTop: 6 }}>
                <div className="mock-bar">
                  <span className="mock-title">Computed example</span>
                  <span className="mock-tag"><span className="vdot" />v2.4</span>
                </div>
                <div className="mock-body">
                  <table className="mtable">
                    <thead>
                      <tr><th>Line</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {EXAMPLE_LINES.map(r => (
                        <tr key={r.line}><td>{r.line}</td><td>{r.amount}</td></tr>
                      ))}
                      <tr className="total"><td>Net working capital</td><td>$486,200</td></tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: 16 }}>
                    <KV k="Peg (12-mo avg)" v="$486,200" />
                    <KV k="Delivered NWC at close" v="$501,900" />
                    <KV k="Purchase-price adjustment" v="+$15,700" pos />
                  </div>
                </div>
              </div>

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
