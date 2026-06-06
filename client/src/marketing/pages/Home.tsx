import { Link } from 'wouter';
import { MarketingShell } from '../MarketingShell';
import { Brand } from '../Brand';
import { YuliaLauncher } from '../YuliaChat';
import { CLOSER_CAPABILITIES } from '../components/ClosingCTA';
import { enterApp } from '../useEnterApp';
import { HeroWorkspace } from '../components/HeroWorkspace';
import { ScrollGrow } from '../components/ScrollGrow';
import { ProductFrame } from '../components/ProductFrame';
import {
  ChatIngestMock,
  ModelBuildMock,
  CIMDeliverMock,
  PRODUCE_MOCKS,
} from '../components/ProductMocks';

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
      {/* HERO — one unit: headline, lead, launcher, AND the deal card, all on the
          dark band (Notion-style — the white product card sits on the dark hero). */}
      <section className="dark" style={{ paddingTop: 'clamp(56px,9vw,120px)', paddingBottom: 'clamp(56px,8vw,110px)' }}>
        <div className="wrap center stack" style={{ alignItems: 'center', gap: 0 }}>
          <h1 className="display reveal" data-d="1" style={{ margin: 0, maxWidth: '16ch' }}>
            Analyst-grade deal work. On demand.
          </h1>
          <p className="lead reveal measure-wide" data-d="2" style={{ margin: '22px auto 0', textAlign: 'center' }}>
            Yulia is an AI deal-intelligence assistant. She builds the valuations,
            quality-of-earnings adjustments, working capital pegs, financing models,
            and CIMs that used to take a deal team — from your real numbers, with
            every figure traceable to its source.
          </p>
          <div className="reveal" data-d="3" style={{ width: '100%' }}>
            <YuliaLauncher />
          </div>
        </div>
        {/* The deal workspace, inside the hero. color:var(--ink) resets the inherited
            text to dark so the white card reads correctly on the dark band. */}
        <div className="wrap" style={{ marginTop: 'clamp(44px,6vw,80px)', color: 'var(--ink)' }}>
          <ScrollGrow>
            <HeroWorkspace />
          </ScrollGrow>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 64 }}>
            <span className="eyebrow">How it works</span>
            <h2 style={{ marginTop: 18 }}>You talk. Yulia builds.</h2>
          </div>
          <div className="grid g3" style={{ gap: 38 }}>
            <div className="step-showcase reveal">
              <ProductFrame variant="browser" url="app.smbx.ai/chat" delay={0.05}>
                <ChatIngestMock />
              </ProductFrame>
              <div className="step"><span className="sn">01</span><h3>Tell Yulia what you’re working on.</h3><p>A business you’re buying, selling, raising for, or integrating. Upload a tax return, paste a few numbers, or just name the company.</p></div>
            </div>
            <div className="step-showcase reveal" data-d="1">
              <ProductFrame variant="browser" url="app.smbx.ai/deal" delay={0.1}>
                <ModelBuildMock />
              </ProductFrame>
              <div className="step"><span className="sn">02</span><h3>Yulia computes the work product.</h3><p>Not a summary of what you should do — the actual model, allocation, or document, with assumptions you can change and sources you can check.</p></div>
            </div>
            <div className="step-showcase reveal" data-d="2">
              <ProductFrame variant="browser" url="app.smbx.ai/cim" delay={0.15}>
                <CIMDeliverMock />
              </ProductFrame>
              <div className="step"><span className="sn">03</span><h3>Take it anywhere.</h3><p>Export to PDF, Excel, or Word. Or keep working — Yulia carries the deal state forward as the deal moves.</p></div>
            </div>
          </div>
        </div>
      </section>


      {/* WHAT SMBX PRODUCES */}
      <section className="tint">
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 56 }}>
            <span className="eyebrow">The work product</span>
            <h2 style={{ marginTop: 18 }}>Real artifacts, not advice.</h2>
          </div>
          <div className="grid g3">
            {PRODUCES.map((f, i) => {
              const Mock = PRODUCE_MOCKS[i];
              return (
                <div className="feature feature-showcase reveal" data-d={(i % 3)} key={f.h}>
                  {Mock && <Mock />}
                  <h3>{f.h}</h3>
                  <p>{f.p}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* THE DILIGENCE STANDARD */}
      <section>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          <div className="reveal">
            <span className="eyebrow">The Diligence Standard</span>
            <h2 style={{ marginTop: 18 }}>The methodology is open. Read it before you trust it.</h2>
          </div>
          <div className="reveal" data-d="1">
            <p className="lead" style={{ margin: 0 }}>
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
          <h2 className="reveal" style={{ maxWidth: '20ch', margin: '0 auto' }}><Brand /> is software.</h2>
          <p className="lead reveal measure-wide" data-d="1" style={{ margin: '24px auto 0' }}>
            It is not a broker-dealer, investment adviser, or business broker. It is not
            a law firm, accounting firm, or appraiser. It does not negotiate, sign, file,
            hold funds, recommend transactions, or match buyers and sellers for a fee.
          </p>
          <p className="reveal" data-d="2" style={{ margin: '22px auto 0', fontFamily: 'var(--mono)', letterSpacing: '.04em', color: 'var(--accent)' }}>
            <Brand /> computes. You decide.
          </p>
        </div>
      </section>

      {/* CLOSING ZIG-ZAG — pricing + CTA combined into one wide alternating band */}
      <ClosingZigzag />
    </MarketingShell>
  );
}

function PriceRow({ plan, note }: { plan: string; note: string }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', gap: 20, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
      <span className="mono" style={{ fontWeight: 500, minWidth: 110 }}>{plan}</span>
      <span style={{ color: 'var(--ink-2)', fontSize: '.92rem', textAlign: 'right' }}>{note}</span>
    </div>
  );
}

/**
 * ClosingZigzag — Home's combined pricing + CTA closer, built on the shared
 * journey-stepper zig-zag (.zz-* classes): two rows alternating down a center
 * spine. Replaces the two narrow centered sections that read sparse once the
 * column went wide. Row 1 = pricing (copy left, price-list card right); row 2 =
 * CTA (capability chips left, heading + Ask Yulia right).
 */
function ClosingZigzag() {
  return (
    <section style={{ paddingBottom: 'clamp(44px,6vw,84px)' }}>
      <div className="wrap">
        <ol className="zz-track" style={{ listStyle: 'none' }}>
          <li className="zz-row" style={{ ['--zz-i' as string]: '0' }}>
            <span className="zz-node" aria-hidden="true"><span className="zz-node-dot" /></span>
            <div className="zz-text">
              <h2 className="zz-title">Flat software pricing. Nothing tied to your deal.</h2>
              <p className="mono" style={{ marginTop: 20, fontSize: '.9rem', color: 'var(--ink-3)', lineHeight: 1.6 }}>
                No success fees. No percentage of your deal. No fee tied to whether it closes.
              </p>
              <div style={{ marginTop: 24 }}>
                <Link href="/pricing" className="link-arrow">
                  See full pricing
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
              </div>
            </div>
            <div className="zz-visual">
              <div className="mock" style={{ padding: '6px 24px' }}>
                <PriceRow plan="Free" note="One deliverable, free." />
                <PriceRow plan="$99 / mo" note="Valuation, scoring, diligence." />
                <PriceRow plan="$249 / mo" note="+ CIMs, deal rooms, discovery." />
                <PriceRow plan="$749 / mo" note="+ shared vault, templates, seats." />
                <PriceRow plan="$3,000+ / mo" note="+ single-tenant, SSO, agents." />
              </div>
            </div>
          </li>
          <li className="zz-row is-odd" style={{ ['--zz-i' as string]: '1' }}>
            <span className="zz-node" aria-hidden="true"><span className="zz-node-dot" /></span>
            <div className="zz-text">
              <h2 className="zz-title">Bring a deal. See what Yulia builds.</h2>
              <p style={{ marginTop: 18, color: 'var(--ink-2)', fontSize: '1.05rem', lineHeight: 1.55 }}>
                Paste a few numbers or a tax return — Yulia turns it into analyst-grade work,
                with every figure traceable to its source.
              </p>
              <div style={{ marginTop: 26 }}>
                <button className="btn btn-accent btn-lg" onClick={() => enterApp()}>Ask Yulia</button>
              </div>
            </div>
            <div className="zz-visual">
              <div className="tags computed-closer-tags">
                {CLOSER_CAPABILITIES.map(c => (
                  <Link key={c} href="/standard" className="tag tag-link">{c}</Link>
                ))}
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
