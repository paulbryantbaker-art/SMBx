/**
 * Raise.tsx — rebuilt on handoff v4 `.h-*` vocabulary.
 * Running example: Acme, Inc. $11M EBITDA owner considering liquidity
 * structures beyond a full sale.
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

export default function Raise({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
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
      canvasKicker="smbx.ai / raise"
      canvasTitle="Raise capital"
      canvasBadge="Demo · Acme, Inc."
      chat={{
        title: 'Yulia',
        status: 'Raise · Acme, Inc.',
        pswLogo: 'A',
        pswName: 'Acme, Inc.',
        pswMeta: 'RAISE · $11M EBITDA',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. This walkthrough is <strong>Acme</strong>'s owner choosing between a full sale and a minority recap. The advisor defaulted to sell. Let me show you the five other paths.",
        reply: "Three inputs: <strong>EBITDA</strong>, <strong>cash needed out</strong>, <strong>do you want to keep running it</strong>. I'll run all six structures.",
        chips: [] as const,
        placeholder: 'Tell me what you need — liquidity, growth capital, or a partial exit…',
        onSend,
        suggested: {
          kicker: 'Next',
          label: 'See the six structures',
          onClick: () => document.getElementById('paths')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
      }}
    >
      <div id="raise" className="h-page" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>

        {/* HERO */}
        <section className="h-today h-anim" id="hero">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <div className="h-today__meta">
                Raise · Acme, Inc.
                <span className="h-today__meta-tag">Demo</span>
              </div>
              <h1 className="h-today__h">You don't have to <em>sell 100% to get liquidity.</em></h1>
              <p className="h-today__sub">
                Yulia models every capital structure — minority equity, ESOP, mezzanine, convertible, recap — against your specific numbers. Builds the investor materials. Targets the right capital partners. <strong>One conversation, six paths modeled.</strong>
              </p>
              <div className="h-today__cta">
                <button className="h-today__btn" type="button" onClick={() => seedChat('Model my liquidity options.')}>
                  Model your path
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button className="h-today__btn h-today__btn--ghost" type="button" onClick={() => onNavigate('pricing')}>See pricing</button>
              </div>
            </div>
            <div className="h-today__demo">
              <div className="h-today__demo-k">Yulia · sell vs. raise · Acme</div>
              <div className="h-today__demo-bubble h-today__demo-bubble--me">What if I don't want to sell the whole thing?</div>
              <div className="h-today__demo-bubble">
                Minority recap — sell 30% for <strong>$33M today</strong>, keep 70%. At 12% EBITDA CAGR you exit year 5 at ~$145M. Your 70% = <strong>$102M</strong>. Total haul <strong>$135M vs. $82M</strong> full-sale today.
              </div>
              <div className="h-today__demo-out">
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">+$53<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>M</span></div>
                  <div className="h-today__demo-out-l">Minority vs. full-sale delta</div>
                </div>
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">3×</div>
                  <div className="h-today__demo-out-l">Size of the second bite</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SIX STRUCTURES */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Six paths · modeled on Acme</div>
            <h2 className="h-sect-h__t">Same $11M EBITDA. <em>Six radically different outcomes.</em></h2>
          </div>
        </div>

        <div className="h-apps" id="paths">
          {[
            {
              n: '01 · Full sale', title: 'Clean break. Maximum cash today.',
              foot: '100% equity sold · tax event now',
              rows: [
                { l: 'Cash today',     r: '$82M', tone: 'ok' },
                { l: 'Retained',        r: '0%',   tone: 'warn' },
                { l: '5yr upside',      r: '—',    tone: 'warn' },
                { l: 'Control',         r: 'None', tone: 'warn' },
              ],
            },
            {
              n: '02 · Majority + rollover', title: 'PE plays this 9 times out of 10.',
              foot: 'Cash today · second bite in 3–5 years',
              rows: [
                { l: 'Cash today',     r: '$58M', tone: 'ok' },
                { l: 'Retained',        r: '30%',  tone: 'ok' },
                { l: '5yr upside',      r: '+$44M', tone: 'ok' },
                { l: 'Control',         r: 'Board seat', tone: 'ok' },
              ],
            },
            {
              n: '03 · Minority recap ★', title: 'Liquidity + second bite + control.',
              foot: 'RECOMMENDED · best 5-year NPV',
              rows: [
                { l: 'Cash today',     r: '$33M', tone: 'ok' },
                { l: 'Retained',        r: '70%',  tone: 'ok' },
                { l: '5yr upside',      r: '+$102M', tone: 'total' },
                { l: 'Control',         r: 'Full', tone: 'ok' },
              ],
              winner: true,
            },
            {
              n: '04 · ESOP', title: '§1042 deferral, culture preserved.',
              foot: '70–80% FMV · 10yr repurchase obligation',
              rows: [
                { l: 'Cash today',     r: '$58M', tone: 'ok' },
                { l: 'Retained',        r: '0%',   tone: 'warn' },
                { l: 'Tax deferral',    r: '§1042', tone: 'ok' },
                { l: 'Role',            r: 'Chair',tone: 'ok' },
              ],
            },
            {
              n: '05 · Preferred + PIK', title: 'Take chips off without selling.',
              foot: '12% PIK · no maintenance covs',
              rows: [
                { l: 'Cash today',     r: '$28M', tone: 'ok' },
                { l: 'Retained',        r: '100%', tone: 'ok' },
                { l: '5yr upside',      r: '+$94M',tone: 'ok' },
                { l: 'Coupon',          r: '12% PIK', tone: 'ok' },
              ],
            },
            {
              n: '06 · Dividend recap', title: 'Keep 100%. Service the debt.',
              foot: '4–6× leverage · 5–7yr term',
              rows: [
                { l: 'Cash today',     r: '$22M', tone: 'ok' },
                { l: 'Retained',        r: '100%', tone: 'ok' },
                { l: 'Leverage',        r: '4.5×',  tone: 'warn' },
                { l: 'Equity dilution', r: '0%',   tone: 'ok' },
              ],
            },
          ].map((s, i) => (
            <a
              key={s.n}
              className={`h-app h-anim${i ? ` h-anim-d${Math.min(i, 3)}` : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); seedChat(`Model the ${s.n.replace(/^\d+\s·\s/, '').toLowerCase()} path on my numbers.`); }}
            >
              <div className="h-app__art">
                <div className="h-app__art-k">{s.n}</div>
                <h3 className="h-app__art-h">{s.title}</h3>
                <div className="h-app__preview">
                  <div className="h-app__row h-app__row--head"><span>Modeled on Acme</span><span>$11M EBITDA</span></div>
                  {s.rows.map((r) => (
                    <div key={r.l} className="h-app__row">
                      <span className="h-app__row-l">{r.l}</span>
                      <span className={`h-app__row-r h-app__row-r--${r.tone}`}>{r.r}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-app__foot">
                <div className="h-app__foot-l">
                  <div className="h-app__foot-t">{s.winner ? 'Recommended' : 'Alternate path'}</div>
                  <div className="h-app__foot-s">{s.foot}</div>
                </div>
                <button className="h-app__get" type="button">Model</button>
              </div>
            </a>
          ))}
        </div>

        {/* RAIL */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Every raise-side capability · one subscription</div>
            <h2 className="h-sect-h__t">What Yulia does when you raise. <em>All of it.</em></h2>
          </div>
        </div>

        <div className="h-rail" id="caps">
          {[
            { ico: '⇌', t: 'Structure comparison', s: 'Six liquidity paths, after-tax, side-by-side.',                  meta: 'Try' },
            { ico: '◨', t: 'Cap-stack modeler',    s: 'Equity, preferred, unitranche, ABL — all in one view.',           meta: 'Try' },
            { ico: '◷', t: 'FCCV stress test',     s: '25% EBITDA dip stress with covenant headroom check.',              meta: 'Preview' },
            { ico: '▤', t: 'Pitch deck drafting',  s: '22 slides, IC voice, thesis + unit econ + use of proceeds.',       meta: 'Live' },
            { ico: '⎙', t: 'Data room',            s: 'Historical financials, cohort analysis, contracts, cap table.',    meta: 'Live' },
            { ico: '⌕', t: 'Investor radar',       s: 'Thesis-matched funds, warm intros, close-rate-ranked.',            meta: 'Live' },
            { ico: '◎', t: 'Readiness score',      s: '17 dimensions an IC grades you on before the first meeting.',      meta: 'Preview' },
            { ico: '✎', t: 'Term-sheet modeling',  s: 'Preferred, participation, liquidation, all modeled to 5yr exit.',  meta: 'Try' },
            { ico: '◫', t: 'LP update engine',     s: '3-page LP updates drafted from your P&L + KPIs.',                   meta: 'Live' },
          ].map((c) => (
            <div key={c.t} className="h-cap">
              <div className="h-cap__ico">{c.ico}</div>
              <div className="h-cap__t">{c.t}</div>
              <div className="h-cap__s">{c.s}</div>
              <div className="h-cap__meta"><span>Raise-side</span><span>{c.meta}</span></div>
            </div>
          ))}
        </div>

        {/* CLAIM */}
        <section className="h-claim h-anim" id="claim">
          <div className="h-claim__l">
            <div className="h-claim__k">The economics</div>
            <h2 className="h-claim__h">Advisors take <em>5.5% of the round.</em></h2>
            <p className="h-claim__p">
              A growth-equity raise clears a placement agent 4–7% of proceeds. On a $25M round, that's $1.5M to the banker. Yulia does the same work — readiness score, pitch deck, data room, investor outreach — for a monthly subscription. You keep the fee.
            </p>
          </div>
          <div className="h-claim__viz">
            {[
              { l: 'Placement fee (5.5%)',   w: '100%', v: '$1.4M',     tone: 'big' },
              { l: 'Legal + diligence',      w: '30%',  v: '$420K',     tone: 'big' },
              { l: 'Pitch prep (8 weeks)',   w: '18%',  v: '$250K',     tone: 'big' },
              { l: 'smbx.ai · Pro',          w: '5%',   v: '$199 / mo', tone: 'small' },
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
            <span>Cap-table cold storage</span>
            <span>Row-level audit log</span>
          </div>
        </div>

        {/* CTA */}
        <section className="h-cta h-anim" id="cta">
          <div className="h-cta__k">Start · No card</div>
          <h2 className="h-cta__h">Not every liquidity event <em>is a sale.</em></h2>
          <p className="h-cta__s">
            Tell Yulia your EBITDA, how much cash you need out, and whether you want to keep running it. She returns all six structures against your numbers — in the chat pane, now.
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
            <span>Six paths modeled</span>
            <span>After-tax math</span>
            <span>No card</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}
