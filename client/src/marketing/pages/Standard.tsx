import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { MarketingShell } from '../MarketingShell';
import { Brand } from '../Brand';
import { enterApp } from '../useEnterApp';

type LibItem = { name: string; desc: string; href?: string };

const LIBRARY: LibItem[] = [
  { name: 'Valuation', desc: 'Multiples, DCF, comparable analysis, sensitivities' },
  { name: 'Earnings quality', desc: 'SDE/EBITDA normalization, add-backs, QoE method' },
  { name: 'Working capital', desc: 'The peg, targets, and purchase-price adjustment', href: '/standard/working-capital-peg' },
  { name: 'Financing', desc: 'SBA DSCR, LBO, debt schedules, IRR/MOIC' },
  { name: 'Structure', desc: 'Asset vs. stock, §1060, earnouts, installment sales' },
  { name: 'Tax', desc: 'Allocation, entity treatment, transfer taxes' },
  { name: 'Legal economics', desc: 'Indemnification, escrow, reps & warranties economics' },
  { name: 'Restructuring', desc: 'Distressed, capital structure, liability management' },
  { name: 'Real estate', desc: 'Asset-class overlays' },
  { name: 'Post-close', desc: 'Integration, value-bridge, 100-day planning' },
];

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

export default function Standard() {
  return (
    <MarketingShell>
      {/* HERO — dark, with stat rail */}
      <section className="dark" style={{ paddingBottom: 'calc(var(--pad-y) * .7)' }}>
        <div className="wrap">
          <div className="std-hero" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 56, alignItems: 'end' }}>
            <div className="reveal">
              <span className="eyebrow">The Diligence Standard</span>
              <h1 className="display" style={{ fontSize: 'clamp(2.4rem,4.8vw,4.2rem)', marginTop: 20, maxWidth: '13ch' }}>
                The methodology, in the open.
              </h1>
              <p className="lead" style={{ marginTop: 24, maxWidth: '50ch' }}>
                Every calculation <Brand /> performs is documented here — its inputs, its
                computation, the authorities that govern it, and a worked example.
                Read it, check it, cite it. No account required.
              </p>
            </div>
            <div className="reveal" data-d="1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <StatRow value="10" label={<>methodology<br />sections</>} />
              <hr className="divider" />
              <StatRow value="v2.4" label={<>current<br />version</>} />
              <hr className="divider" />
              <StatRow value="0" label={<>black<br />boxes</>} />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED WORKED EXAMPLE */}
      <section style={{ paddingTop: 'calc(var(--pad-y) * .55)', paddingBottom: 0 }}>
        <div className="wrap">
          <div className="reveal std-featured" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 40, display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 48, alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Featured · worked example</span>
              <h2 style={{ marginTop: 16, fontSize: 'clamp(1.6rem,2.6vw,2.2rem)', maxWidth: '14ch' }}>
                Every method, shown working.
              </h2>
              <p className="lead" style={{ marginTop: 18, fontSize: '1.12rem', maxWidth: '42ch' }}>
                Take the working capital peg: the inputs, the computation, the
                controlling authorities, and a fully computed example — so you can
                check the math before you trust the model.
              </p>
              <Link href="/standard/working-capital-peg" className="btn btn-ink" style={{ marginTop: 24 }}>
                Read the worked example <ArrowRight />
              </Link>
            </div>
            <div className="mock">
              <div className="mock-bar">
                <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
                <span className="mock-title">standard / working-capital-peg</span>
                <span className="mock-tag"><span className="vdot" />v2.4</span>
              </div>
              <div className="mock-body" style={{ background: 'var(--dk)', margin: -20, padding: 22 }}>
                <pre className="mono" style={{ fontSize: '.84rem', lineHeight: 1.8, color: 'rgba(255,255,255,.85)', margin: 0, whiteSpace: 'pre-wrap' }}>
<span style={{ color: 'rgba(255,255,255,.4)' }}># net working capital</span>{'\n'}
NWC = current assets − current liabilities{'\n'}
<span style={{ color: 'rgba(255,255,255,.4)' }}># the peg</span>{'\n'}
Peg = avg(NWC) over reference period{'\n'}
<span style={{ color: 'rgba(255,255,255,.4)' }}># purchase-price adjustment</span>{'\n'}
Adj = delivered NWC − Peg   <span style={{ color: 'var(--accent)' }}>→ +$15,700</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIBRARY */}
      <section style={{ paddingTop: 'calc(var(--pad-y) * .6)' }}>
        <div className="wrap">
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
            <h2>The library</h2>
            <span className="mono" style={{ fontSize: '.8rem', color: 'var(--ink-3)' }}>
              Each entry: inputs · computation · authorities · worked example
            </span>
          </div>
          <div className="reveal lib">
            {LIBRARY.map(item =>
              item.href ? (
                <Link key={item.name} href={item.href} className="lib-row">
                  <span className="ln">{item.name}</span>
                  <span className="ld">{item.desc}</span>
                  <span className="lgo">Read →</span>
                </Link>
              ) : (
                <div key={item.name} className="lib-row" role="button" tabIndex={0} onClick={() => enterApp()}>
                  <span className="ln">{item.name}</span>
                  <span className="ld">{item.desc}</span>
                  <span className="lgo">Generate in <Brand /> →</span>
                </div>
              )
            )}
          </div>
          <p className="reveal" style={{ marginTop: 28, fontFamily: 'var(--mono)', fontSize: '.82rem', color: 'var(--ink-3)', maxWidth: '64ch', lineHeight: 1.6 }}>
            The Standard is versioned. Each page shows the methodology version it
            documents; superseded versions remain readable.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight center" style={{ background: 'var(--surface-2)' }}>
        <div className="wrap stack reveal" style={{ alignItems: 'center' }}>
          <h2 style={{ maxWidth: '20ch' }}>Read the method. Then watch Yulia run it on your numbers.</h2>
          <div style={{ marginTop: 26 }}>
            <button className="btn btn-accent btn-lg" onClick={() => enterApp()}>Ask Yulia</button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function StatRow({ value, label }: { value: string; label: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div className="mono" style={{ fontSize: '2.4rem', fontWeight: 500, color: '#fff', lineHeight: 1 }}>{value}</div>
      <div className="mono" style={{ fontSize: '.74rem', color: 'rgba(255,255,255,.5)', alignSelf: 'center', lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}
