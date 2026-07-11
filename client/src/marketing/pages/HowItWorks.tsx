/**
 * `/how-it-works` — hi-fi 4e. "High tech. Human touch." — the four things
 * ChatGPT can't do, the $28M worked deal, where the line is. Copy verbatim.
 */
import { MarketingShell, HeroDock } from '../MarketingShell';

export default function HowItWorks() {
  return (
    <MarketingShell
      page="how"
      placeholder="Tell Yulia about your deal…"
      quickReplies={['Run my numbers', 'How are sources cited?']}
    >
      <section className="mk-hero" style={{ paddingBottom: 20 }}>
        <div className="mk-wrap mk-center">
          <h1 className="mk-h1" style={{ maxWidth: '14ch' }}>
            High tech. <em>Human touch.</em>
          </h1>
          <p className="mk-lead" style={{ marginTop: 26, maxWidth: '46em' }}>
            Yulia does about 90% of what an investment bank does — the analysis, the documents,
            the process — and none of the parts that require a license or a judgment call. Here's
            what's actually happening under the hood, and why it holds up when your attorney
            reads it.
          </p>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-center" style={{ gap: 44 }}>
          <h2 className="mk-h2">Four things ChatGPT can't do</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 24, width: 'min(1000px, 100%)', textAlign: 'left' }}>
            <div className="mk-glass" style={{ padding: '34px 36px' }}>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-ink)' }}>
                She knows your deal, not just "M&amp;A."
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.65, color: 'var(--mk-ink-3)' }}>
                Yulia works from your financials, your market, and your criteria — and remembers
                them across months, so the tenth conversation is smarter than the first.
              </p>
            </div>
            <div className="mk-ink-card" style={{ borderRadius: 26, padding: '34px 36px' }}>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-neon)' }}>
                Her numbers are computed, not guessed.
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.65, color: 'var(--mk-w2)' }}>
                Valuations, debt coverage, IRR, sensitivity — these run on a deterministic
                engine, not a language model's best impression of arithmetic. Same inputs, same
                outputs, every time. Auditable. Exportable as real formulas. A large language
                model will confidently get the math wrong; Yulia won't, because she doesn't do
                the math with a language model.
              </p>
            </div>
            <div className="mk-glass" style={{ padding: '34px 36px' }}>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-ink)' }}>
                Every number is sourced.
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.65, color: 'var(--mk-ink-3)' }}>
                Census, BLS, the Federal Reserve, SEC EDGAR, SBA lending data — the same federal
                sources that feed Wall Street research desks. She shows her work, so a
                professional will respect the methodology.
              </p>
            </div>
            <div className="mk-glass" style={{ padding: '34px 36px' }}>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--mk-ink)' }}>
                She drives.
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.65, color: 'var(--mk-ink-3)' }}>
                Yulia doesn't wait to be asked what's next. She runs the process — the way a good
                deal team does — so it doesn't stall in the places deals usually die.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-prose">
            <h2 className="mk-h2">What a real deal looks like</h2>
            <p className="mk-body" style={{ fontSize: 14.5, color: 'var(--mk-ink-3)' }}>
              A mid-sized example — the methodology is the same at every size.
            </p>
            <p className="mk-body">
              Take a <b style={{ color: 'var(--mk-ink)' }}>$28M-revenue industrial services company with $5.4M in
              EBITDA</b> going to market. Yulia builds the preliminary valuation range and shows
              the comps. She recasts three years of financials and surfaces the add-backs the
              owner never documented. She drafts the full confidential information memorandum —
              the 100-page book an analyst spends three months on — as a complete first draft in
              under an hour, sourced to the financials. She builds the buyer universe and screens
              out the chains, subsidiaries, and roll-ups that aren't real targets. She models the
              debt structures a buyer might use and flags the diligence issues before a buyer
              finds them.
            </p>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, fontWeight: 600, color: 'var(--mk-green)' }}>
              Weeks of a full deal team's work, driven from a conversation — with you making
              every decision along the way.
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="mk-glass mk-glass-lg" style={{ width: 'min(880px, 100%)', padding: 'clamp(30px, 4vw, 48px) clamp(30px, 4.2vw, 56px)' }}>
            <h2 className="mk-h2" style={{ fontSize: 'clamp(24px, 2.2vw, 30px)' }}>
              Where the line is (and why it protects you)
            </h2>
            <p className="mk-body" style={{ marginTop: 16 }}>
              Yulia generates analysis and documents. She does not negotiate on your behalf,
              represent you to a counterparty, hold your money, practice law, or take a
              percentage of your deal. Those things require licenses and fiduciary duties — and
              honestly, they require a human.
            </p>
            <p className="mk-body" style={{ marginTop: 14 }}>
              So when your deal needs judgment and a license, Yulia tells you, and connects you
              to vetted M&amp;A attorneys, transaction CPAs, and SBA lenders. The platform handles
              the intelligence and the process. The professionals handle the judgment. That's not
              a limitation — that's how deals are supposed to work.
            </p>
            <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.65, color: 'var(--mk-ink-3)' }}>
              This is a partnership with the professionals you hire, not a replacement for them.
              A client who arrives prepared makes every advisor's job easier — and every
              advisor's fee more justified.
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-prose">
            <h2 className="mk-h2" style={{ fontSize: 'clamp(24px, 2.2vw, 30px)' }}>The deal doesn't end at the wire</h2>
            <p className="mk-body">
              Most tools stop at close. Yulia keeps going — into the first 180 days after you
              buy, with an integration plan, a Day Zero checklist, and the value-creation work
              that turns a good purchase into a great one. The same continuity runs the other way
              for sellers preparing years ahead. One relationship, the whole lifecycle.
            </p>
          </div>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-wrap mk-center">
          <div style={{ width: '100%' }}>
            <HeroDock />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
