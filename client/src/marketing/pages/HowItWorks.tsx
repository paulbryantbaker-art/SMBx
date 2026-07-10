/**
 * `/how-it-works` — wireframe 5f. The anti-"just ChatGPT" page: one worked
 * example shown with its math, the deterministic engine, and the timeline
 * with the email ask marked honestly.
 */
import { MarketingShell, HeroDock } from '../MarketingShell';

export default function HowItWorks() {
  return (
    <MarketingShell
      page="how"
      placeholder="Tell Yulia about your deal…"
      quickReplies={['Run my numbers', 'How are sources cited?']}
    >
      <section className="mk-hero" style={{ paddingBottom: 12 }}>
        <div className="mk-wrap mk-center" style={{ gap: 12 }}>
          <h1 className="mk-h1">Not guessed. Computed.</h1>
          <p className="mk-hero-sub" style={{ maxWidth: '52ch' }}>
            One worked example, first message to close — a $5.2M-EBITDA machining company.
          </p>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 8 }}>
        <div className="mk-wrap">
          <div className="mk-timeline">
            <div>Talk</div>
            <div className="is-hot">Baseline™</div>
            <div>Rundown™</div>
            <div>Deal work</div>
            <div>Close</div>
          </div>
          <p className="mk-note" style={{ marginTop: 8 }}>
            The one thing she asks for along the way: where to send your Baseline™. That's the
            account — no password wall, and the first answers come before it.
          </p>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-ledger">
            <div>
              <b>The math, shown</b>
              <div className="mk-card mk-sample" style={{ marginTop: 8, maxWidth: 460 }}>
                <div className="mk-rows">
                  <div><span>Adjusted EBITDA</span><b>$5.2M</b></div>
                  <div><span>Market multiple (precision machining)</span><b>4.2–4.8×</b></div>
                </div>
                <span className="mk-num mk-num-lg">
                  $21.8M<span className="dash">–</span>$25.0M
                </span>
                <span className="mk-note">each factor carries its source — comps set, adjustments, date</span>
              </div>
            </div>
            <div>
              <b>Same inputs → same answer</b>
              <p style={{ margin: '6px 0 0', fontSize: 14.5, color: 'var(--mk-ink-2)', maxWidth: '58ch' }}>
                The numbers come from a deterministic engine, not free-form generation — sourced
                (Census, BLS, market comps), reproducible, and versioned. Ask her to show the math
                on anything; that's the point.
              </p>
            </div>
            <div>
              <b>The deliverable</b>
              <p style={{ margin: '6px 0 0', fontSize: 14.5, color: 'var(--mk-ink-2)', maxWidth: '58ch' }}>
                The Rundown™ — the full deal document: valuation with receipts, add-backs,
                structure options, diligence list. Every number expandable to its source.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-wrap mk-center">
          <div style={{ width: 'min(520px, 100%)' }}>
            <HeroDock />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
