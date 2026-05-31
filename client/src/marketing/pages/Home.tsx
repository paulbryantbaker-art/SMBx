import { Link } from 'wouter';
import { MarketingShell } from '../MarketingShell';
import { YuliaLauncher } from '../YuliaChat';
import { enterApp } from '../useEnterApp';

/* KV row helper */
function KV({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className="v" style={accent ? { color: 'var(--accent-strong)' } : undefined}>{v}</span>
    </div>
  );
}

const SENSITIVITY = [
  { m: '3.0×', w: '58%', v: '$3.17M' },
  { m: '3.5×', w: '70%', v: '$3.70M' },
  { m: '4.0×', w: '80%', v: '$4.23M' },
  { m: '4.5×', w: '91%', v: '$4.76M' },
  { m: '5.0×', w: '100%', v: '$5.29M' },
];

const CAPABILITIES = [
  ['Working capital peg', 'Quality-of-earnings preview', 'LBO & SBA models'],
  ['Valuation baseline', '§1060 allocation', 'CIM & pitch books'],
  ['Structuring scenarios', 'Covenant compliance', '100-day plan'],
].flat();

const PRODUCES: Array<{ h: string; p: string }> = [
  { h: 'Valuation', p: 'A defensible valuation baseline — multiples, DCF, and the sensitivities that move the number.' },
  { h: 'Quality of earnings', p: 'A QoE-style adjustment preview that normalizes SDE and EBITDA the way a buyer’s diligence team will. (Not an audit, review, or compilation.)' },
  { h: 'Working capital', p: 'The peg calculation, the target, and what happens to the purchase price when the number moves.' },
  { h: 'Financing', p: 'SBA debt service coverage, LBO entry/exit, IRR and MOIC — modeled, not estimated.' },
  { h: 'Structure', p: 'Asset vs. stock, §1060 allocation, earnouts, rollovers — the tax and economic consequences of each, side by side.' },
  { h: 'Documents', p: 'CIMs, pitch books, IC decks, lender books — drafted from the deal state, with citations.' },
];

export default function Home() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section style={{ paddingTop: 'clamp(60px,9vw,110px)', paddingBottom: 0 }}>
        <div className="wrap center stack" style={{ alignItems: 'center', gap: 0 }}>
          <span className="eyebrow reveal">M&amp;A diligence, computed</span>
          <h1 className="display reveal" data-d="1" style={{ margin: '22px 0 0', maxWidth: '16ch' }}>
            Analyst-grade deal work. On demand.
          </h1>
          <p className="lead reveal measure-wide" data-d="2" style={{ margin: '26px auto 0', textAlign: 'center' }}>
            Yulia is an AI deal-intelligence assistant. She builds the valuations,
            quality-of-earnings adjustments, working capital pegs, financing models,
            and CIMs that used to take a deal team — from your real numbers, with
            every figure traceable to its source.
          </p>
          <div className="reveal" data-d="3" style={{ width: '100%' }}>
            <YuliaLauncher />
          </div>
        </div>

        {/* hero artifact */}
        <div className="wrap-wide reveal" data-d="4" style={{ marginTop: 64 }}>
          <div className="mock" style={{ maxWidth: 880, margin: '0 auto' }}>
            <div className="mock-bar">
              <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
              <span className="mock-title">Valuation baseline</span>
              <span className="mock-tag"><span className="vdot" />computed · methodology v2.4</span>
            </div>
            <div className="mock-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 34, alignItems: 'start' }}>
                <div>
                  <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Enterprise value baseline</div>
                  <div className="mono" style={{ fontSize: '2.6rem', fontWeight: 500, letterSpacing: '-.03em', margin: '6px 0 2px' }}>$4.24M</div>
                  <div style={{ fontSize: '.86rem', color: 'var(--ink-3)', marginBottom: 20 }}>Range $3.8M – $4.7M · blended of three methods</div>
                  <KV k="Adjusted EBITDA" v="$1,058,000" />
                  <KV k="Applied multiple" v="4.0×" />
                  <KV k="SDE (normalized)" v="$1,312,000" />
                  <KV k="DCF (10yr, 18% WACC)" v="$4,410,000" />
                  <KV k="Comparable median" v="3.8×" />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>Sensitivity — value at each multiple</div>
                  <div className="bars">
                    {SENSITIVITY.map(row => (
                      <div className="bar-row" key={row.m}>
                        <span className="bl">{row.m}</span>
                        <span className="bar-track"><span className="bar-fill" style={{ width: row.w }} /></span>
                        <span className="bv">{row.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mono" style={{ marginTop: 22, fontSize: '.74rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 7, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3FAE6B', display: 'inline-block' }} />
                    Every figure traces to its source · hash 0x9f3a…d21
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="section-tight">
        <div className="wrap">
          <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="tags" style={{ flex: 1, minWidth: 280 }}>
              {CAPABILITIES.map(c => <span className="tag" key={c}>{c}</span>)}
            </div>
            <p className="body mono" style={{ maxWidth: '30ch', fontSize: '.95rem', lineHeight: 1.55, color: 'var(--ink-3)' }}>
              Every artifact is computed, hash-verifiable, and pinned to the methodology that produced it.
            </p>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 64 }}>
            <span className="eyebrow">How it works</span>
            <h2 style={{ marginTop: 18 }}>You talk. Yulia builds.</h2>
          </div>
          <div className="grid" style={{ gap: 38, maxWidth: 720 }}>
            <div className="step reveal"><span className="sn">01</span><h3>Tell Yulia what you’re working on.</h3><p>A business you’re buying, selling, raising for, or integrating. Upload a tax return, paste a few numbers, or just name the company.</p></div>
            <div className="step reveal" data-d="1"><span className="sn">02</span><h3>Yulia computes the work product.</h3><p>Not a summary of what you should do — the actual model, allocation, or document, with assumptions you can change and sources you can check.</p></div>
            <div className="step reveal" data-d="2"><span className="sn">03</span><h3>Take it anywhere.</h3><p>Export to PDF, Excel, or Word. Or keep working — Yulia carries the deal state forward as the deal moves.</p></div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* WHAT SMBX PRODUCES */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 56 }}>
            <span className="eyebrow">The work product</span>
            <h2 style={{ marginTop: 18 }}>Real artifacts, not advice.</h2>
          </div>
          <div className="grid g3">
            {PRODUCES.map((f, i) => (
              <div className="feature reveal" data-d={(i % 3)} key={f.h}>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* THE DILIGENCE STANDARD */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '52ch' }}>
            <span className="eyebrow">The Diligence Standard</span>
            <h2 style={{ marginTop: 18 }}>The methodology is open. Read it before you trust it.</h2>
            <p className="lead" style={{ marginTop: 22 }}>
              Every number Yulia produces traces to The Diligence Standard — our published
              methodology library. Each model has its inputs, its computation, its
              controlling authorities, and a worked example. No black box.
            </p>
            <div style={{ marginTop: 30 }}>
              <Link href="/standard" className="link-arrow">
                Read the Standard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT SMBX IS NOT — dark safe-harbor block */}
      <section className="dark">
        <div className="wrap center">
          <h2 className="reveal" style={{ maxWidth: '20ch', margin: '0 auto' }}>smbX is software.</h2>
          <p className="lead reveal measure-wide" data-d="1" style={{ margin: '24px auto 0' }}>
            It is not a broker-dealer, investment adviser, or business broker. It is not
            a law firm, accounting firm, or appraiser. It does not negotiate, sign, file,
            hold funds, recommend transactions, or match buyers and sellers for a fee.
          </p>
          <p className="reveal" data-d="2" style={{ margin: '22px auto 0', fontFamily: 'var(--mono)', letterSpacing: '.04em', color: 'var(--accent)' }}>
            smbX computes. You decide.
          </p>
        </div>
      </section>

      {/* PRICING SUMMARY */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '54ch', marginBottom: 44 }}>
            <span className="eyebrow">Pricing</span>
            <h2 style={{ marginTop: 18 }}>Flat software pricing. Nothing tied to your deal.</h2>
          </div>
          <div className="grid" style={{ gap: 10, maxWidth: 720 }}>
            <PriceRow plan="Free" note="Talk to Yulia as much as you want. One deliverable, free." />
            <PriceRow plan="$99 / mo" note="Unlimited valuation, scoring, and diligence artifacts." />
            <PriceRow plan="$249 / mo" note="+ CIMs, deal rooms, structuring, and market discovery." />
            <PriceRow plan="$749 / mo" note="+ shared vault, firm templates, and seats." />
            <PriceRow plan="$3,000+ / mo" note="+ single-tenant, SSO, and governed agent scope." />
          </div>
          <p className="mono" style={{ marginTop: 26, fontSize: '.9rem', color: 'var(--ink-3)' }}>
            No success fees. No percentage of your deal. No fee tied to whether it closes.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link href="/pricing" className="link-arrow">
              See full pricing
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* CLOSING CTA */}
      <section className="center">
        <div className="wrap stack" style={{ alignItems: 'center' }}>
          <h2 className="reveal" style={{ maxWidth: '18ch' }}>Bring a deal. See what Yulia builds.</h2>
          <div className="reveal" data-d="1" style={{ marginTop: 30 }}>
            <button className="btn btn-accent btn-lg" onClick={() => enterApp()}>Ask Yulia</button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function PriceRow({ plan, note }: { plan: string; note: string }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', gap: 20, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
      <span className="mono" style={{ fontWeight: 500, minWidth: 120 }}>{plan}</span>
      <span style={{ color: 'var(--ink-2)', fontSize: '.95rem', textAlign: 'right' }}>{note}</span>
    </div>
  );
}
