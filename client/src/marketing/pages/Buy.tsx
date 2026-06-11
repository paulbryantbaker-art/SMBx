import type { ReactNode } from 'react';
import { MarketingShell } from '../MarketingShell';
import { YuliaLauncher } from '../YuliaChat';
import { ClosingCTA } from '../components/ClosingCTA';
import { ProductFrame } from '../components/ProductFrame';
import { DealPipelineMock, SensitivityMock, DataRoomMock } from '../components/ProductMocks';

/* KV row helper (mirrors Home.tsx) */
function KV({ k, v, accent, tone }: { k: string; v: string; accent?: boolean; tone?: 'pos' | 'neg' }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className={`v${tone ? ' ' + tone : ''}`} style={accent ? { color: 'var(--accent-strong)' } : undefined}>{v}</span>
    </div>
  );
}

/* One stage row in the journey walkthrough */
function Stage({ code, title, children, note }: { code: string; title: string; children: ReactNode; note?: string }) {
  return (
    <div className="stage">
      <div className="scode">{code}<b>{title}</b></div>
      <div className="sbody">
        <p>{children}</p>
        {note && <p className="snote">{note}</p>}
      </div>
    </div>
  );
}

const WHY = [
  { h: '3 methods', p: 'Multiples, DCF, and comparables — one defensible baseline.' },
  { h: 'Every figure', p: 'Traceable to its source and the methodology version behind it.' },
  { h: 'Yours', p: 'Change any assumption and the model re-computes.' },
  { h: 'Portable', p: 'Export to PDF, Excel, or Word with a hash-verifiable trail.' },
];

export default function Buy() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingBottom: 'calc(var(--pad-y) * .55)' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <span className="eyebrow">For buyers</span>
            <h1 className="display" data-d="1" style={{ marginTop: 20, maxWidth: '14ch' }}>
              Diligence at the speed you need to move.
            </h1>
            <p className="lead reveal" data-d="2" style={{ marginTop: 24, maxWidth: '46ch' }}>
              Searchers, PE, family offices, and strategics use Yulia to turn a pile of
              seller financials into a defensible valuation, a QoE preview, a financing
              model, and a structuring view — fast enough to keep up with a live process.
            </p>
            <blockquote className="yq reveal" data-d="3" style={{ margin: '26px 0 0' }}>
              &ldquo;Adjusted EBITDA normalizes to $1,058,000, which prices the $4.24M
              indicative value at 4.0&times;. The working capital peg is $486,200 &mdash; and
              two diligence items are still open.&rdquo;
              <span className="yq-who">&mdash; Yulia, on Apex HVAC</span>
            </blockquote>
            <div className="reveal" data-d="4">
              <YuliaLauncher />
            </div>
          </div>
          <div className="reveal" data-d="2">
            <div className="mock" style={{ maxWidth: 440, margin: '0 auto' }}>
              <div className="mock-bar">
                <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
                <span className="mock-title">Deal — Apex HVAC</span>
                <span className="mock-tag"><span className="vdot" />live</span>
              </div>
              <div className="mock-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Indicative value</div>
                    <div className="mono" style={{ fontSize: '2rem', fontWeight: 500 }}>$4.24M</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Fit score</div>
                    <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: 'var(--accent-strong)' }}>82</div>
                  </div>
                </div>
                <KV k="Stage" v="B3 · Diligence" />
                <KV k="Adjusted EBITDA" v="$1,058,000" />
                <KV k="Working capital peg" v="$486,200" />
                <KV k="Open items" v="2" tone="neg" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* THE BUY-SIDE PATH */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 44 }}>
            <span className="eyebrow">The work, stage by stage</span>
            <h2 style={{ marginTop: 18 }}>From thesis to close.</h2>
          </div>

          {/* product surfaces for the buy-side path — sourcing, returns, diligence */}
          <div className="reveal" style={{ marginBottom: 24 }}>
            <ProductFrame variant="browser" url="app.smbx.ai/sourcing" delay={0.05}>
              <DealPipelineMock />
            </ProductFrame>
          </div>
          <div className="grid g2 reveal" style={{ gap: 24, marginBottom: 64 }}>
            <ProductFrame variant="browser" url="app.smbx.ai/lbo" delay={0.1}>
              <SensitivityMock />
            </ProductFrame>
            <ProductFrame variant="browser" url="app.smbx.ai/dataroom" delay={0.15}>
              <DataRoomMock variant="diligence" />
            </ProductFrame>
          </div>

          <div className="stages reveal">
            <Stage code="B0 · Thesis" title="Define the box">
              Industry, size, geography, return targets. Yulia pressure-tests the
              thesis against what the numbers will need to show.
            </Stage>
            <Stage code="B1 · Sourcing" title="An intelligence brief on every target">
              Screen targets against the thesis. Yulia builds the intelligence brief
              on each one.
            </Stage>
            <Stage code="B2 · Valuation" title="A number you can defend">
              A valuation baseline from the seller&rsquo;s actuals — multiples, DCF, and
              the sensitivities that matter. Defensible, not aspirational.
            </Stage>
            <Stage code="B3 · Due diligence" title="What their team will find" note="Not an audit, review, or compilation.">
              A quality-of-earnings preview that normalizes SDE/EBITDA the way your
              lender&rsquo;s diligence team will. Working capital peg. Customer concentration.
            </Stage>
            <Stage code="B4 · Structuring" title="Every structure, with consequences">
              Asset vs. stock, &sect;1060 allocation, earnouts, seller notes, rollover
              equity — modeled side by side with the tax and economic consequences of each.
            </Stage>
            <Stage code="B5 · Closing" title="A portable package, hash-verified">
              Funds flow, close-readiness checklist, and a portable deal package with a
              hash-verifiable audit trail.
            </Stage>
          </div>
        </div>
      </section>

      {/* WHY BUYERS USE IT — dark */}
      <section className="dark">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <h2 style={{ maxWidth: '14ch' }}>Analyst firepower without the analyst.</h2>
            <p className="lead" style={{ marginTop: 24, maxWidth: '46ch' }}>
              You see the numbers a diligence team would build, in the time it takes to
              read a CIM. Every figure traces to its source. Every assumption is yours to
              change. Nothing leaves your control.
            </p>
          </div>
          <div className="reveal" data-d="1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {WHY.map(c => (
              <div className="card" key={c.h}>
                <div className="mono" style={{ fontSize: '1.7rem', fontWeight: 500, color: '#fff' }}>{c.h}</div>
                <p style={{ marginTop: 8 }}>{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <ClosingCTA heading="Have a deal in front of you?" launcher />
    </MarketingShell>
  );
}
