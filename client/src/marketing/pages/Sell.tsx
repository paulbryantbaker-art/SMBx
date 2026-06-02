import type { ReactNode } from 'react';
import { MarketingShell } from '../MarketingShell';
import { Brand } from '../Brand';
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

export default function Sell() {
  return (
    <MarketingShell>
      {/* HERO — centered editorial */}
      <section style={{ paddingTop: 'clamp(56px,8vw,100px)', paddingBottom: 0 }}>
        <div className="wrap center stack" style={{ alignItems: 'center', gap: 0 }}>
          <span className="eyebrow reveal">For owners</span>
          <h1 className="display reveal" data-d="1" style={{ marginTop: 22, maxWidth: '15ch' }}>
            See your business the way a buyer will.
          </h1>
          <p className="lead reveal measure-wide" data-d="2" style={{ margin: '24px auto 0', textAlign: 'center' }}>
            Before a buyer&rsquo;s diligence team takes your numbers apart, Yulia shows you
            what they&rsquo;ll find — your real earnings, your working capital, your defensible
            value — and packages it the way a serious process requires.
          </p>
          <div className="reveal" data-d="3" style={{ width: '100%' }}>
            <YuliaLauncher />
          </div>
        </div>
      </section>

      {/* BEFORE → AFTER (the value lift) */}
      <section>
        <div className="wrap">
          <div className="reveal center" style={{ maxWidth: '46ch', margin: '0 auto 48px' }}>
            <span className="eyebrow" style={{ justifyContent: 'center' }}>The number that sets your price</span>
            <h2 style={{ marginTop: 16 }}>Your profit isn&rsquo;t your value.</h2>
          </div>
          <div className="reveal" style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)', boxShadow: '0 30px 60px -42px rgba(25,24,19,.4)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 20, padding: '40px 36px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Reported profit</div>
                <div className="mono" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 500, color: 'var(--ink-3)', marginTop: 8 }}>$612k</div>
                <p className="body" style={{ fontSize: '.9rem', marginTop: 12 }}>What the tax return shows</p>
              </div>
              <div style={{ color: 'var(--ink-3)' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--accent-strong)' }}>Normalized SDE</div>
                <div className="mono" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 500, marginTop: 8 }}>$1.31M</div>
                <p className="body" style={{ fontSize: '.9rem', marginTop: 12 }}>What a buyer underwrites to</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', padding: '20px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span className="mono" style={{ fontSize: '.82rem', color: 'var(--ink-3)' }}>8 add-backs identified · owner comp, one-time items, personal expense</span>
              <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--accent-strong)' }}>2.1&times; lift</span>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* THE SELL-SIDE PATH */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 56 }}>
            <span className="eyebrow">The work, stage by stage</span>
            <h2 style={{ marginTop: 18 }}>From first question to closing table.</h2>
          </div>
          <div className="stages reveal">
            <Stage code="S0 · Intake" title="Frame what a buyer wants to see">
              Tell Yulia about the business. She frames what a buyer will want to see.
            </Stage>
            <Stage code="S1 · Financials" title="Normalize your earnings">
              Yulia normalizes your earnings — add-backs, owner comp, one-time items —
              into the SDE and EBITDA a buyer will underwrite to.
            </Stage>
            <Stage code="S2 · Valuation" title="A defensible baseline">
              A defensible valuation baseline. What the business is worth, on what
              multiple, and what moves the number.
            </Stage>
            <Stage code="S3 · Packaging" title="A CIM from your actuals">
              A CIM drafted from your actuals, with the working capital and
              quality-of-earnings views a buyer expects.
            </Stage>
            <Stage code="S4 · Market matching" title="Understand the buyer landscape" note="smbX does not contact buyers or broker the sale.">
              Yulia helps you understand the buyer landscape and what each type will value.
            </Stage>
            <Stage code="S5 · Closing" title="Close-ready and portable">
              Close-readiness, funds flow, and a portable deal package.
            </Stage>
          </div>
        </div>
      </section>

      {/* NO BROKER FEE — dark statement */}
      <section className="dark center">
        <div className="wrap reveal" style={{ maxWidth: '24ch', margin: '0 auto' }}>
          <h2 className="statement" style={{ margin: '0 auto' }}>
            <span className="amber">No</span> broker fee.<br />No agenda.
          </h2>
          <p className="lead" style={{ margin: '24px auto 0', maxWidth: '46ch' }}>
            <Brand /> charges a flat software fee, never a percentage of your sale. Yulia has
            no incentive to push you toward a deal or a price. She shows you the analysis;
            the decisions are yours.
          </p>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="center">
        <div className="wrap stack reveal" style={{ alignItems: 'center' }}>
          <h2 style={{ maxWidth: '18ch' }}>Thinking about selling? Start with what it&rsquo;s worth.</h2>
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
