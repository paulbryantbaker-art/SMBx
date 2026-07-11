/**
 * `/sell` — hi-fi 4b. Owner voice: the regret stats, the hope-vs-trade gap,
 * Blind Equity™, selling twice, project + Monday morning. Copy verbatim.
 */
import { MarketingShell, HeroDock } from '../MarketingShell';

export default function Sell() {
  return (
    <MarketingShell
      page="sell"
      placeholder="Tell Yulia about your business…"
      quickReplies={['How did you get this?', 'What would sharpen my number?']}
    >
      <section className="mk-hero">
        <div className="mk-wrap mk-center">
          <div className="mk-eyebrow" style={{ marginBottom: 22 }}>For owners</div>
          <h1 className="mk-h1 mk-h1-sub" style={{ maxWidth: '17ch' }}>
            Know your number.<br />Then choose how you exit.
          </h1>
          <p className="mk-lead" style={{ marginTop: 26, maxWidth: '46em' }}>
            A full sale is one option. So is selling most of the business to a bigger platform
            and rolling the rest into equity for a second payday later. Yulia gives you the real
            number first — the money hiding in your own financials included — then models every
            path, so you choose the exit that fits your business and your life, not the one a
            buyer steers you toward.
          </p>
          <div style={{ marginTop: 44, width: '100%' }}>
            <HeroDock />
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-prose">
            <h2 className="mk-h2">The part nobody tells you</h2>
            <p className="mk-body">
              <b style={{ color: 'var(--mk-ink)' }}>Three out of four owners who sell their business regret it within a
              year.</b> That's not our number — it's the Exit Planning Institute's, from thousands
              of former owners.
            </p>
            <p className="mk-body">
              The regrets are almost always the same three things. They left money on the table
              they never knew was there. They had no plan for the Monday morning after. And they
              picked the wrong buyer because they had no way to tell a good offer from a bad one.
            </p>
            <p className="mk-body">
              Here's the harder part: almost all of it was preventable. The owners who look back
              without regret had one thing in common. <em style={{ fontWeight: 600 }}>They knew their numbers cold,
              and they started early.</em>
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-splitrow">
            <div className="copy">
              <h2 className="mk-h2" style={{ fontSize: 'clamp(25px, 2.3vw, 32px)' }}>
                What's it actually worth? (Probably not what you think.)
              </h2>
              <p className="mk-body">
                Most owners believe their business is worth a multiple of revenue. It's worth a
                multiple of profit — and a smaller multiple than the headlines suggest. Service
                businesses trade around 2.5× SDE on average, not the double-digit multiples you
                hear about public companies.
              </p>
              <p className="mk-body">
                Yulia gives you <b style={{ color: 'var(--mk-ink)' }}>The Baseline™</b> in the first conversation: a real
                preliminary range, built from your revenue and your industry's actual multiples,
                sourced to federal data. Not a guess. Not a broker trying to win your listing. A
                number you can stand behind.
              </p>
            </div>
            <div className="card">
              <div className="mk-ink-card" style={{ width: 'min(400px, 100%)' }}>
                <div className="mk-eyebrow-neon">The gap, in one deal</div>
                <div className="row" style={{ marginTop: 14 }}><span>Revenue</span><b>$2.0M</b></div>
                <div className="row"><span>Real earnings (SDE)</span><b>$300K</b></div>
                <div className="row"><span>What owners hope</span><span style={{ fontWeight: 600, color: 'var(--mk-w4)', textDecoration: 'line-through' }}>≈ $2M</span></div>
                <div className="row" style={{ borderBottom: 0, alignItems: 'baseline' }}>
                  <span>Where it really trades</span>
                  <span className="mk-num-neon" style={{ fontSize: 28 }}>≈ $750K</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.6, color: 'var(--mk-w4)' }}>
                  That gap is where deals fall apart — and where preparation earns its keep.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="mk-glass mk-glass-lg" style={{ width: 'min(880px, 100%)', padding: 'clamp(32px, 4vw, 50px) clamp(30px, 4.2vw, 56px)' }}>
            <h2 className="mk-h2">The money you didn't know you had</h2>
            <p className="mk-body" style={{ marginTop: 18 }}>
              This is the part owners remember. Yulia reads your financials the way a buyer's
              analyst will — but on your side. The personal vehicle. The family payroll. The
              above-market rent to your own building. The one-time legal bill. Every legitimate
              add-back she finds raises your earnings, and every dollar of earnings gets
              multiplied.
            </p>
            <p className="mk-body" style={{ marginTop: 14 }}>
              We call it <b style={{ color: 'var(--mk-ink)' }}>Blind Equity™</b>: value that's genuinely yours, just
              buried where a buyer won't pay for it until someone documents it properly. On a
              typical deal, that's <em style={{ fontWeight: 700 }}>six figures</em>. Sometimes it's the difference
              between the number you need and the number you'd have settled for.
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-prose">
            <h2 className="mk-h2">You might not be selling once. You might be selling twice.</h2>
            <p className="mk-body">
              A lot of owners in this market don't cash out all at once. They sell most of the
              business to a private-equity-backed platform rolling up their industry — take real
              money off the table today — and roll the rest into equity in the combined company.
              When that bigger company sells again a few years later, they get a second check.
              Sometimes the second bite is larger than the first.
            </p>
            <p className="mk-body">
              That can be the best outcome available to you. It can also be a quiet trap. Rolled
              equity isn't cash — it's a minority stake in someone else's company, with their
              debt, their board, and their timeline. What class of equity you hold, what gets
              paid out before you do, and what happens if the plan slips are exactly the terms
              that decide whether that "upside" is real or just a number in a pitch deck.
            </p>
            <p className="mk-body">
              <b style={{ color: 'var(--mk-ink)' }}>Yulia models both bites.</b> What you clear today, what the rollover
              could be worth under different exit scenarios, and what the equity terms actually
              mean in plain English — so you're weighing a real second payday against a real
              risk, not taking a buyer's word for what their stock is worth. And if a straight
              sale is the better deal for you, she'll show you that too. No agenda. Just the math
              on both.
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section-tight mk-section">
        <div className="mk-wrap">
          <div className="mk-splitrow" style={{ alignItems: 'stretch', gap: 32 }}>
            <div className="mk-glass" style={{ width: 'min(424px, 100%)', padding: '38px 40px' }}>
              <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-ink)' }}>
                Selling isn't a decision. It's a project.
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--mk-ink-3)' }}>
                The median business sits on the market <b style={{ color: 'var(--mk-ink)' }}>168 days</b> — after the 12
                to 24 months of preparation that make it sellable. Whether it's a full sale, a
                partner buyout, the platform-and-rollover path, an ESOP, or raising capital —
                Yulia models each one and keeps the process moving so it never stalls where deals
                usually die.
              </p>
            </div>
            <div className="mk-glass" style={{ width: 'min(424px, 100%)', padding: '38px 40px' }}>
              <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-ink)' }}>
                And Monday morning?
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--mk-ink-3)' }}>
                The 75% regret number is driven almost entirely by owners who had no plan for the
                next chapter. Yulia makes sure the financial part is handled cleanly — your
                after-tax number, a structure that protects you, a buyer who'll respect what you
                built — so the decision is about your life, not a number you're still unsure of.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-center">
          <h2 className="mk-h2" style={{ fontSize: 'clamp(28px, 2.6vw, 34px)' }}>
            Free to start. No catch. <em>No cut of your deal, ever.</em>
          </h2>
          <p className="mk-body" style={{ marginTop: 20, maxWidth: '38em', color: 'var(--mk-ink-3)' }}>
            The first analysis costs you nothing — Yulia earns your trust before she earns your
            business. When you're ready to run the deal for real, it's one flat fee to run the
            whole thing to close — never a percentage of what your company sells for. You keep
            control, and you keep the fee you'd have handed a banker.
          </p>
          <p className="mk-body" style={{ marginTop: 14, maxWidth: '38em', color: 'var(--mk-ink-3)' }}>
            Tell Yulia about your business — in a few minutes you'll know more about what you
            have than most owners learn in a year of thinking about it.
          </p>
          <div style={{ marginTop: 40, width: '100%' }}>
            <HeroDock />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
