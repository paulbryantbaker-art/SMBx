import type { ReactNode } from 'react';
import { MarketingShell } from '../MarketingShell';
import { Brand } from '../Brand';
import { YuliaLauncher } from '../YuliaChat';
import { ClosingCTA } from '../components/ClosingCTA';
import { ProductFrame } from '../components/ProductFrame';
import { CIMDeliverMock, BuyerListMock, DataRoomMock } from '../components/ProductMocks';
import { AddBackLedger } from '../components/AddBackLedger';

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
          <blockquote className="yq reveal" data-d="3" style={{ margin: '26px auto 0', textAlign: 'center' }}>
            &ldquo;Your reported $612k is really $1.31M. Here are the eight add-backs a
            buyer&rsquo;s team will find.&rdquo;
            <span className="yq-who">— Yulia, on the sample deal below</span>
          </blockquote>
          <div className="reveal" data-d="4" style={{ width: '100%' }}>
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
          {/* LIVE add-back ledger: toggle a line, the SDE / lift / valuation
              range all re-derive through core.ts. Replaces the static
              before→after card AND the old MiniValuation (whose $38–52M
              Northwind range contradicted this page's $1.31M-SDE deal). */}
          <div className="reveal">
            <AddBackLedger />
          </div>
        </div>
      </section>


      {/* THE SELL-SIDE PATH */}
      <section>
        <div className="wrap">
          <div className="reveal" style={{ maxWidth: '60ch', marginBottom: 44 }}>
            <span className="eyebrow">The work, stage by stage</span>
            <h2 style={{ marginTop: 18 }}>From first question to closing table.</h2>
          </div>

          {/* product surfaces for the sell-side path — CIM, data room, buyer landscape */}
          <div className="grid g2 reveal" style={{ gap: 24, marginBottom: 24 }}>
            <ProductFrame variant="browser" url="app.smbx.ai/cim" delay={0.05}>
              <CIMDeliverMock />
            </ProductFrame>
            <ProductFrame variant="browser" url="app.smbx.ai/dataroom" delay={0.1}>
              <DataRoomMock title="Seller data room" variant="sell" />
            </ProductFrame>
          </div>
          <div className="reveal" style={{ marginBottom: 64 }}>
            <ProductFrame variant="browser" url="app.smbx.ai/buyers" delay={0.15}>
              <BuyerListMock />
            </ProductFrame>
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
            <Stage code="S4 · Market matching" title="Understand the buyer landscape" note="smbX.ai does not contact buyers or broker the sale.">
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
        <div className="wrap reveal" style={{ margin: '0 auto' }}>
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
      <ClosingCTA heading="Thinking about selling? Start with what it’s worth." launcher />
    </MarketingShell>
  );
}
