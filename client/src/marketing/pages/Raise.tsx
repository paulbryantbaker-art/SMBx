import type { ReactNode } from 'react';
import { MarketingShell } from '../MarketingShell';
import { YuliaLauncher } from '../YuliaChat';
import { enterApp } from '../useEnterApp';

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

/* A readiness row in the raise-package mock */
function ReadyRow({ label, status, ready }: { label: string; status: string; ready?: boolean }) {
  return (
    <div className="kv">
      <span className="k mono" style={{ fontSize: '.86rem' }}>{label}</span>
      <span className={`v${ready ? ' pos' : ''}`} style={{ fontSize: '.78rem', color: ready ? undefined : 'var(--ink-3)' }}>{status}</span>
    </div>
  );
}

export default function Raise() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingBottom: 'calc(var(--pad-y) * .5)' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr .9fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <span className="eyebrow">For operators raising capital</span>
            <h1 className="display" data-d="1" style={{ fontSize: 'clamp(2.4rem,4.6vw,4rem)', marginTop: 20, maxWidth: '14ch' }}>
              The package capital providers actually require.
            </h1>
            <p className="lead reveal" data-d="2" style={{ marginTop: 24, maxWidth: '48ch' }}>
              Whether you&rsquo;re raising debt or equity, Yulia builds the financial package,
              the investor materials, and the terms analysis a sophisticated lender or
              investor will expect — before they ask.
            </p>
            <div className="reveal" data-d="3">
              <YuliaLauncher />
            </div>
          </div>
          <div className="reveal" data-d="2">
            <div className="mock" style={{ maxWidth: 420, margin: '0 auto' }}>
              <div className="mock-bar">
                <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
                <span className="mock-title">Raise package</span>
                <span className="mock-tag"><span className="vdot" />14 / 16 ready</span>
              </div>
              <div className="mock-body">
                <ReadyRow label="Normalized financials" status="ready" ready />
                <ReadyRow label="5-year projection" status="ready" ready />
                <ReadyRow label="Cap table & terms" status="ready" ready />
                <ReadyRow label="Investor deck" status="ready" ready />
                <ReadyRow label="Customer cohorts" status="draft" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* THE RAISE PATH */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 56 }}>
            <span className="eyebrow">The work, stage by stage</span>
            <h2 style={{ marginTop: 18 }}>From intake to closing the round.</h2>
          </div>
          <div className="stages reveal">
            <Stage code="R0 · Intake" title="What, why, against what">
              What you&rsquo;re raising, why, and against what.
            </Stage>
            <Stage code="R1 · Financial package" title="Financials & projections">
              Normalized financials, projections, and the metrics that matter to your
              capital source.
            </Stage>
            <Stage code="R2 · Investor materials" title="Deck & data room">
              A deck and data room drafted from the package.
            </Stage>
            <Stage code="R3 · Outreach" title="Who funds deals like yours" note="smbX does not solicit or contact investors on your behalf.">
              Understand who funds deals like yours and what they underwrite to.
            </Stage>
            <Stage code="R4 · Terms" title="Model every term">
              Model the cap table, dilution, and the economics of each term you&rsquo;re offered.
            </Stage>
            <Stage code="R5 · Closing" title="Funds flow & package">
              Funds flow and a portable package.
            </Stage>
          </div>
        </div>
      </section>

      {/* R1 — FINANCIAL PACKAGE */}
      <section>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <span className="eyebrow">R1 · Financial package</span>
            <h2 style={{ marginTop: 18, maxWidth: '13ch' }}>Projections a lender will accept.</h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: '44ch' }}>
              Normalized financials and a five-year projection built from your real
              numbers — tied to the metrics your capital source underwrites to, not
              aspirational hockey sticks.
            </p>
          </div>
          <div className="mock reveal" data-d="1">
            <div className="mock-bar">
              <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
              <span className="mock-title">Revenue projection — 5yr</span>
              <span className="mock-tag"><span className="vdot" />computed</span>
            </div>
            <div className="mock-body">
              <div className="bars">
                <div className="bar-row"><span className="bl">Y1</span><span className="bar-track"><span className="bar-fill" style={{ width: '40%' }} /></span><span className="bv">$4.2M</span></div>
                <div className="bar-row"><span className="bl">Y2</span><span className="bar-track"><span className="bar-fill" style={{ width: '52%' }} /></span><span className="bv">$5.4M</span></div>
                <div className="bar-row"><span className="bl">Y3</span><span className="bar-track"><span className="bar-fill" style={{ width: '66%' }} /></span><span className="bv">$6.9M</span></div>
                <div className="bar-row"><span className="bl">Y4</span><span className="bar-track"><span className="bar-fill" style={{ width: '83%' }} /></span><span className="bv">$8.6M</span></div>
                <div className="bar-row"><span className="bl">Y5</span><span className="bar-track"><span className="bar-fill" style={{ width: '100%' }} /></span><span className="bv">$10.4M</span></div>
              </div>
              <div style={{ display: 'flex', gap: 28, borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 16 }}>
                <div>
                  <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>CAGR</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--accent-strong)' }}>25%</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Gross margin</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 500 }}>62%</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Rule of 40</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 500 }}>47</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* R2 — INVESTOR MATERIALS (dark) */}
      <section className="dark">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <span className="eyebrow">R2 · Investor materials</span>
            <h2 style={{ marginTop: 18, maxWidth: '16ch' }}>A deck and a data room, ready to send.</h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: '44ch' }}>
              Yulia drafts the investor deck and assembles the data room straight from your
              package — consistent numbers, every figure cited.
            </p>
            <p className="mono" style={{ marginTop: 18, fontSize: '.8rem', color: 'rgba(255,255,255,.5)' }}>
              smbX does not solicit or contact investors on your behalf.
            </p>
          </div>
          <div className="reveal" data-d="1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div className="mono" style={{ fontSize: '1.7rem', fontWeight: 500, color: '#fff' }}>14 slides</div>
              <p style={{ marginTop: 8 }}>An investor deck drafted from your package, every figure cited.</p>
            </div>
            <div className="card">
              <div className="mono" style={{ fontSize: '1.7rem', fontWeight: 500, color: '#fff' }}>Data room</div>
              <p style={{ marginTop: 8 }}>Assembled from the same numbers — consistent across every document.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="center">
        <div className="wrap stack reveal" style={{ alignItems: 'center' }}>
          <h2 style={{ maxWidth: '16ch' }}>Raising soon? Build the package first.</h2>
          <div style={{ marginTop: 30, width: '100%' }}>
            <YuliaLauncher />
          </div>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-accent btn-lg" onClick={() => enterApp()}>Ask Yulia</button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
