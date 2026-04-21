/**
 * HowItWorks.tsx — rebuilt on handoff v4 `.h-*` vocabulary.
 */
import { useEffect, useRef } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

export default function HowItWorks({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>('.h-anim');
    if (!targets.length) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const pulseChat = () => {
    const input = document.getElementById('chatInput') as HTMLInputElement | null;
    input?.focus();
    document.getElementById('chat')?.animate(
      [{ boxShadow: '0 0 0 0 rgba(10,10,11,0.25)' }, { boxShadow: '0 0 0 14px rgba(10,10,11,0)' }],
      { duration: 720, easing: 'cubic-bezier(0.22,0.8,0.32,1)' },
    );
  };

  const seedChat = (text: string) => {
    const input = document.getElementById('chatInput') as HTMLInputElement | null;
    if (!input) return;
    input.value = text;
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="smbx.ai / how it works"
      canvasTitle="How it works"
      canvasBadge="Under the hood"
      chat={{
        title: 'Yulia',
        status: 'Ask me anything',
        pswLogo: 'Y',
        pswName: 'Yulia',
        pswMeta: 'SMBX · GENERAL',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. This page explains what I actually do, what I don't, and where my math comes from. Ask me anything specific.",
        reply: "Try a concrete question — <em>\"what's my add-back range for a $4M plumbing shop?\"</em> works better than <em>\"how does it work?\"</em>",
        chips: [] as const,
        placeholder: 'Ask Yulia anything…',
        onSend,
        suggested: {
          kicker: 'Next',
          label: 'What Yulia does vs. doesn\'t',
          onClick: () => document.getElementById('scope')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
      }}
    >
      <div id="how" className="h-page" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>

        {/* HERO */}
        <section className="h-today h-anim" id="hero">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <div className="h-today__meta">
                How it works
                <span className="h-today__meta-tag">No fluff</span>
              </div>
              <h1 className="h-today__h">90% of what an investment bank does. <em>Everything that doesn't require a license.</em></h1>
              <p className="h-today__sub">
                Yulia handles the production work — valuations, CIMs, financial models, deal scoring, diligence, LOIs, integration plans. You keep the judgment, the relationships, and the authority to sign. <strong>22 deterministic formulas.</strong> Not AI estimates.
              </p>
              <div className="h-today__cta">
                <button className="h-today__btn" type="button" onClick={() => seedChat('Show me the math behind a valuation.')}>
                  Ask about the math
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button className="h-today__btn h-today__btn--ghost" type="button" onClick={() => onNavigate('pricing')}>See pricing</button>
              </div>
            </div>
            <div className="h-today__demo">
              <div className="h-today__demo-k">Yulia · sample Q&A</div>
              <div className="h-today__demo-bubble h-today__demo-bubble--me">Is this just ChatGPT with a wrapper?</div>
              <div className="h-today__demo-bubble">
                No. LLMs hallucinate arithmetic — <strong>unacceptable in M&amp;A</strong>. I use 22 deterministic formulas. Same input, same output, every time. Auditable. The LLM handles the narrative; the code handles the math. You can argue with any number.
              </div>
              <div className="h-today__demo-out">
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">22</div>
                  <div className="h-today__demo-out-l">Deterministic formulas</div>
                </div>
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">0</div>
                  <div className="h-today__demo-out-l">AI-estimated numbers</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOUR CARDS — scope + IB compare + math + sample */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Under the hood</div>
            <h2 className="h-sect-h__t">What I do. <em>What I don't.</em></h2>
          </div>
        </div>

        <div className="h-apps" id="scope">
          {/* 01 · Yulia does */}
          <a className="h-app h-anim" href="#" onClick={(e) => { e.preventDefault(); seedChat('What does Yulia actually do on a sell-side deal?'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">01 · Yulia does</div>
              <h3 className="h-app__art-h">Production work. Documents. Math. Coordination.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Scope of service</span><span>STATE</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Generate documents (CIMs, LOIs, models)</span><span className="h-app__row-r h-app__row-r--ok">Yes</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Draft communications to send</span><span className="h-app__row-r h-app__row-r--ok">Yes</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Score, rank, stress-test</span><span className="h-app__row-r h-app__row-r--ok">Yes</span></div>
                <div className="h-app__row"><span className="h-app__row-l">22 deterministic formulas</span><span className="h-app__row-r h-app__row-r--ok">Yes</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Coordinate across parties</span><span className="h-app__row-r h-app__row-r--ok">Yes</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">What I do</div>
                <div className="h-app__foot-s">The production work a banker or analyst charges hours for.</div>
              </div>
              <button className="h-app__get" type="button">Scope</button>
            </div>
          </a>

          {/* 02 · Yulia doesn't */}
          <a className="h-app h-anim h-anim-d1" href="#" onClick={(e) => { e.preventDefault(); seedChat('What does Yulia NOT do?'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">02 · Yulia doesn't</div>
              <h3 className="h-app__art-h">Judgment. Relationships. Legal counsel.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>What you keep</span><span>WHY</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Decide for you</span><span className="h-app__row-r h-app__row-r--warn">Trade-offs</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Negotiate on your behalf</span><span className="h-app__row-r h-app__row-r--warn">Never</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Legal, tax, appraisal advice</span><span className="h-app__row-r h-app__row-r--warn">Licensed only</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Hold, transfer, or escrow funds</span><span className="h-app__row-r h-app__row-r--warn">Never</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Charge success fees</span><span className="h-app__row-r h-app__row-r--warn">Subscription only</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">What I don't</div>
                <div className="h-app__foot-s">You sign every document. You make every call. I show my work.</div>
              </div>
              <button className="h-app__get" type="button">Scope</button>
            </div>
          </a>

          {/* 03 · IB comparison */}
          <a className="h-app h-anim h-anim-d2" href="#" onClick={(e) => { e.preventDefault(); seedChat('Show me the IB comparison table.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">03 · IB comparison</div>
              <h3 className="h-app__art-h">Every banker deliverable. Timed head-to-head.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Deliverable</span><span>IB → YULIA</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Preliminary valuation</span><span className="h-app__row-r h-app__row-r--total">1wk → 20m</span></div>
                <div className="h-app__row"><span className="h-app__row-l">CIM (32pp)</span><span className="h-app__row-r h-app__row-r--total">3–4wk → 3d</span></div>
                <div className="h-app__row"><span className="h-app__row-l">IOI analysis</span><span className="h-app__row-r h-app__row-r--total">2d → 5m</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Working-capital peg</span><span className="h-app__row-r h-app__row-r--total">3–5d → 3m</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">Total human hours</span><span className="h-app__row-r h-app__row-r--total">400 → 0</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Banker vs. Yulia</div>
                <div className="h-app__foot-s">Same deliverables. You still sign, still decide, still make the calls.</div>
              </div>
              <button className="h-app__get" type="button">Compare</button>
            </div>
          </a>

          {/* 04 · Sample conversation */}
          <a className="h-app h-anim h-anim-d3" href="#" onClick={(e) => { e.preventDefault(); seedChat("I'm looking at a pest control company. $1.2M rev. Asking $2.8M."); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">04 · Sample conversation</div>
              <h3 className="h-app__art-h">From listing to counter in four messages.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Pest control · Phoenix</span><span>90s</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Asking (out of range)</span><span className="h-app__row-r h-app__row-r--warn">$2.8M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Prelim SDE range</span><span className="h-app__row-r h-app__row-r--ok">$240–360K</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Fair value (recurring mix)</span><span className="h-app__row-r h-app__row-r--ok">$1.1–1.4M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Owner-dependency discount</span><span className="h-app__row-r h-app__row-r--warn">0.5–1.0×</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">Counter to offer</span><span className="h-app__row-r h-app__row-r--total">$900K–$1.2M</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Verbatim transcript</div>
                <div className="h-app__foot-s">First-time buyer, 4-message exchange, ends with a defensible counter.</div>
              </div>
              <button className="h-app__get" type="button">Read</button>
            </div>
          </a>
        </div>

        {/* RAIL — 22 formulas */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">The math · 22 deterministic formulas</div>
            <h2 className="h-sect-h__t">Show me the work. <em>Every time.</em></h2>
          </div>
        </div>

        <div className="h-rail" id="math">
          {[
            { ico: '$', t: 'SDE calculation',                     s: 'Seller discretionary earnings with full add-back schedule.', meta: 'Valuation' },
            { ico: '▦', t: 'EBITDA normalization',                s: 'Non-recurring + related-party + owner-comp normalization.',  meta: 'Valuation' },
            { ico: '◎', t: 'Comparable transaction multiple',    s: 'Private-market comps · size + sector + recurring matched.', meta: 'Valuation' },
            { ico: '◨', t: 'DCF valuation',                       s: 'Three-statement with WACC, terminal value, sensitivity.',   meta: 'Valuation' },
            { ico: '◷', t: 'DSCR / FCCV',                         s: 'Coverage ratios with 3×3 EBITDA × rate shock grid.',         meta: 'Financing' },
            { ico: '⇌', t: 'SBA SOP 50 10 8 compliance',          s: 'Eligibility + structure test under current rules.',          meta: 'Financing' },
            { ico: '◫', t: 'Personal guarantee stress test',     s: '6 scenarios that actually kill acquisitions.',                meta: 'Financing' },
            { ico: '⎙', t: '7-dimension Rundown',                 s: 'Weighted deal score predictive of close rate.',               meta: 'Scoring' },
            { ico: '⟟', t: 'Working-capital peg',                 s: '12-mo trailing avg with seasonal adjustment.',                meta: 'Structure' },
          ].map((c) => (
            <div key={c.t} className="h-cap">
              <div className="h-cap__ico">{c.ico}</div>
              <div className="h-cap__t">{c.t}</div>
              <div className="h-cap__s">{c.s}</div>
              <div className="h-cap__meta"><span>{c.meta}</span><span>Formula</span></div>
            </div>
          ))}
        </div>

        {/* CLAIM */}
        <section className="h-claim h-anim" id="claim">
          <div className="h-claim__l">
            <div className="h-claim__k">The difference</div>
            <h2 className="h-claim__h">A banker prices against <em>the hour.</em></h2>
            <p className="h-claim__p">
              Bankers bill for the work — retainer + analyst hours + success fee. Yulia bills for the subscription. Same deliverables. Same quality. You still sign every document. The math is auditable.
            </p>
          </div>
          <div className="h-claim__viz">
            {[
              { l: 'Boutique M&A retainer',    w: '100%', v: '$1.4M',      tone: 'big' },
              { l: 'Big-4 integration',         w: '68%',  v: '$900K',      tone: 'big' },
              { l: 'Growth-equity placement',   w: '52%',  v: '5.5%',       tone: 'big' },
              { l: 'smbx.ai',                   w: '5%',   v: '$4K / mo',   tone: 'small' },
            ].map((r) => (
              <div key={r.l} className="h-claim__row" data-tone={r.tone}>
                <span className="h-claim__row-l">{r.l}</span>
                <span className="h-claim__row-bar"><span className="h-claim__row-fill" style={{ ['--w' as string]: r.w } as React.CSSProperties} /></span>
                <span className="h-claim__row-v">{r.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST */}
        <div className="h-trust" id="trust">
          <div className="h-trust__k">Under NDA by default</div>
          <div className="h-trust__list">
            <span>SOC 2 Type II</span>
            <span>Single-tenant inference</span>
            <span>No training on your data</span>
            <span>Source-cited market data</span>
            <span>Row-level audit log</span>
          </div>
        </div>

        {/* CTA */}
        <section className="h-cta h-anim" id="cta">
          <div className="h-cta__k">Start · No card</div>
          <h2 className="h-cta__h">Argue with the math. <em>I'll show my work.</em></h2>
          <p className="h-cta__s">
            Every number traces to a formula. Every formula traces to public data. Every deliverable ends with "Review and send when ready." Ask me anything in the chat pane.
          </p>
          <button className="h-cta__point" type="button" onClick={pulseChat}>
            <span className="h-cta__point-ar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            Start in the chat pane
            <span style={{ opacity: 0.65, fontWeight: 500 }}>Yulia is ready</span>
          </button>
          <div className="h-cta__meta">
            <span>22 formulas</span>
            <span>0 AI estimates</span>
            <span>Sources cited</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}
