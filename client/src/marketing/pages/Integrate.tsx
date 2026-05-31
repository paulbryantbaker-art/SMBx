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

export default function Integrate() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingBottom: 'calc(var(--pad-y) * .5)' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <span className="eyebrow">For new owners and operators</span>
            <h1 className="display" data-d="1" style={{ fontSize: 'clamp(2.4rem,4.6vw,4rem)', marginTop: 20, maxWidth: '14ch' }}>
              The first 100 days, planned from the actuals.
            </h1>
            <p className="lead reveal" data-d="2" style={{ marginTop: 24, maxWidth: '46ch' }}>
              The deal closed. Now the work starts. Yulia turns the diligence you already
              did into a working integration plan — what to stabilize first, what to
              assess, where the value actually is.
            </p>
            <div className="reveal" data-d="3">
              <YuliaLauncher />
            </div>
          </div>
          <div className="reveal" data-d="2" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="mock" style={{ width: 280, textAlign: 'center' }}>
              <div className="mock-bar">
                <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
                <span className="mock-title">Integration clock</span>
              </div>
              <div className="mock-body" style={{ padding: '34px 24px' }}>
                <div className="mono" style={{ fontSize: '4.6rem', fontWeight: 500, lineHeight: 1, letterSpacing: '-.04em' }}>07</div>
                <div className="mono" style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginTop: 6 }}>of 100 days</div>
                <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, marginTop: 20, overflow: 'hidden' }}>
                  <div style={{ width: '7%', height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
                </div>
                <div className="mono" style={{ fontSize: '.74rem', color: 'var(--accent-strong)', marginTop: 14 }}>Phase · Stabilization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* THE POST-CLOSE PATH */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 56 }}>
            <span className="eyebrow">The work, stage by stage</span>
            <h2 style={{ marginTop: 18 }}>From Day 0 to a steady operation.</h2>
          </div>
          <div className="stages reveal">
            <Stage code="PMI0 · Day 0" title="The first-week checklist">
              The first-week checklist — payroll, banking, systems, key relationships.
            </Stage>
            <Stage code="PMI1 · Stabilization" title="What cannot break">
              What cannot break. Yulia maps the critical paths and the risks to each.
            </Stage>
            <Stage code="PMI2 · Assessment" title="Where it makes money — and where it leaks">
              A clear read on where the business actually makes money and where it leaks.
            </Stage>
            <Stage code="PMI3 · Optimization" title="The value-creation plan">
              The value-creation plan, sequenced by impact and effort.
            </Stage>
          </div>
        </div>
      </section>

      {/* PMI2 — ASSESSMENT (dark) */}
      <section className="dark">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal" data-d="1" style={{ order: 2 }}>
            <span className="eyebrow">PMI2 · Assessment</span>
            <h2 style={{ marginTop: 18, maxWidth: '14ch' }}>Where it makes money — and where it leaks.</h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: '44ch' }}>
              Yulia breaks the business down to its real economics, so you can see exactly
              where margin is created and where it&rsquo;s quietly lost.
            </p>
          </div>
          <div className="reveal" style={{ order: 1 }}>
            <div className="mock" style={{ background: 'var(--dk-2)', borderColor: 'var(--dk-line)' }}>
              <div className="mock-bar" style={{ background: 'var(--dk-2)', borderColor: 'var(--dk-line)' }}>
                <span className="mock-title" style={{ color: 'rgba(255,255,255,.5)' }}>Revenue → EBITDA composition</span>
              </div>
              <div className="mock-body" style={{ color: '#fff' }}>
                <div style={{ display: 'flex', height: 42, borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
                  <div style={{ width: '38%', background: 'var(--surface-3)' }} />
                  <div style={{ width: '30%', background: 'var(--ink-3)' }} />
                  <div style={{ width: '9%', background: '#C0562F' }} />
                  <div style={{ width: '23%', background: 'var(--accent)' }} />
                </div>
                <div className="kv" style={{ borderColor: 'var(--dk-line)' }}><span className="k" style={{ color: 'rgba(255,255,255,.7)' }}>COGS</span><span className="v" style={{ color: '#fff' }}>$1.60M</span></div>
                <div className="kv" style={{ borderColor: 'var(--dk-line)' }}><span className="k" style={{ color: 'rgba(255,255,255,.7)' }}>Operating expense</span><span className="v" style={{ color: '#fff' }}>$1.26M</span></div>
                <div className="kv" style={{ borderColor: 'var(--dk-line)' }}><span className="k" style={{ color: 'rgba(255,255,255,.7)' }}>Identified leakage</span><span className="v" style={{ color: '#fff' }}>$0.38M</span></div>
                <div className="kv" style={{ borderColor: 'var(--dk-line)' }}><span className="k" style={{ color: 'rgba(255,255,255,.7)' }}>EBITDA</span><span className="v" style={{ color: 'var(--accent)' }}>$0.96M</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PMI3 — OPTIMIZATION */}
      <section>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 56, alignItems: 'center' }}>
          <div className="reveal">
            <span className="eyebrow">PMI3 · Optimization</span>
            <h2 style={{ marginTop: 18, maxWidth: '13ch' }}>A value-creation plan, sequenced.</h2>
            <p className="lead" style={{ marginTop: 22, maxWidth: '44ch' }}>
              The initiatives that move EBITDA, ranked by impact and effort — so you do the
              high-leverage work first, not the easy work first.
            </p>
            <div style={{ marginTop: 24 }}>
              <div className="row" style={{ justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontWeight: 500 }}>Reprice underwater accounts</span>
                <span className="tag" style={{ fontSize: '.7rem' }}>High · Low effort</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontWeight: 500 }}>Renegotiate top suppliers</span>
                <span className="tag" style={{ fontSize: '.7rem' }}>High · Med effort</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ fontWeight: 500 }}>Shift mix to service revenue</span>
                <span className="tag" style={{ fontSize: '.7rem' }}>Med · Med effort</span>
              </div>
            </div>
          </div>
          <div className="mock reveal" data-d="1">
            <div className="mock-bar">
              <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
              <span className="mock-title">EBITDA value bridge</span>
              <span className="mock-tag"><span className="vdot" />computed</span>
            </div>
            <div className="mock-body">
              <div className="bars">
                <div className="bar-row"><span className="bl">Today</span><span className="bar-track"><span className="bar-fill" style={{ width: '70%' }} /></span><span className="bv">$0.96M</span></div>
                <div className="bar-row"><span className="bl">Pricing</span><span className="bar-track"><span className="bar-fill" style={{ width: '83%' }} /></span><span className="bv">+$0.18M</span></div>
                <div className="bar-row"><span className="bl">Procure</span><span className="bar-track"><span className="bar-fill" style={{ width: '92%' }} /></span><span className="bv">+$0.12M</span></div>
                <div className="bar-row"><span className="bl">Target</span><span className="bar-track"><span className="bar-fill" style={{ width: '100%' }} /></span><span className="bv">$1.38M</span></div>
              </div>
              <div style={{ borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: '.74rem', color: 'var(--ink-3)' }}>Upside to EBITDA</span>
                <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--accent-strong)' }}>+44%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="center">
        <div className="wrap stack reveal" style={{ alignItems: 'center' }}>
          <h2 style={{ maxWidth: '16ch' }}>Just closed? Start the clock with a plan.</h2>
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
