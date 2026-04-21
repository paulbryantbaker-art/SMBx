/**
 * Integrate.tsx — rebuilt on handoff v4 `.h-*` vocabulary.
 * Running example: Day 3 post-close of Acme. Ray is at the office.
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

export default function Integrate({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
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
      canvasKicker="smbx.ai / integrate"
      canvasTitle="Integrate an acquisition"
      canvasBadge="Demo · Acme, Inc. · Day 3"
      chat={{
        title: 'Yulia',
        status: 'Post-close · Day 3',
        pswLogo: 'A',
        pswName: 'Acme, Inc.',
        pswMeta: 'INTEGRATE · DAY 3',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. You closed <strong>Acme</strong> Friday. It's Monday morning. Ray is at the office for the handoff. Scroll to see what the first 180 days look like — generated from the DD data you already produced.",
        reply: "Send me the <strong>LOI</strong> and a <strong>chart of accounts</strong>. I'll have a Day-0 checklist and a 180-day runbook on your desk in two hours.",
        chips: [] as const,
        placeholder: 'Tell me about the business you just bought…',
        onSend,
        suggested: {
          kicker: 'Next',
          label: 'See the Day-0 checklist',
          onClick: () => document.getElementById('day0')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
      }}
    >
      <div id="integrate" className="h-page" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>

        {/* HERO */}
        <section className="h-today h-anim" id="hero">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <div className="h-today__meta">
                Post-close · Acme, Inc.
                <span className="h-today__meta-tag">Demo</span>
              </div>
              <h1 className="h-today__h">Day 1 after the wire. <em>Do you have a plan?</em></h1>
              <p className="h-today__sub">
                75% of acquisitions miss their stated synergies. The #1 reason: no integration plan. Yulia builds the 180-day plan from your deal data — risks identified, opportunities found, people to protect. <strong>Auto-generated before the wire hits.</strong>
              </p>
              <div className="h-today__cta">
                <button className="h-today__btn" type="button" onClick={() => seedChat('We just closed on an acquisition.')}>
                  Build the plan
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button className="h-today__btn h-today__btn--ghost" type="button" onClick={() => onNavigate('pricing')}>See pricing</button>
              </div>
            </div>
            <div className="h-today__demo">
              <div className="h-today__demo-k">Yulia · Day 3 · Acme close</div>
              <div className="h-today__demo-bubble h-today__demo-bubble--me">What's the red one?</div>
              <div className="h-today__demo-bubble">
                <strong>Texas reseller permit.</strong> Ray's name is on it. TX holds that credential with the individual, not the entity. Can't invoice TX commercial (~$8M annual) until transfer clears. I drafted Ray's signed consent — in your docket. 10 business days.
              </div>
              <div className="h-today__demo-out">
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">62</div>
                  <div className="h-today__demo-out-l">Day-0 checklist items</div>
                </div>
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">$8<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>M</span></div>
                  <div className="h-today__demo-out-l">TX revenue on the flag</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOUR PHASES */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Day 0 to Day 180</div>
            <h2 className="h-sect-h__t">The plan that survives close. <em>Executed one day at a time.</em></h2>
          </div>
        </div>

        <div className="h-apps" id="phases">
          {/* 01 · Day 0 */}
          <a className="h-app h-anim" id="day0" href="#" onClick={(e) => { e.preventDefault(); seedChat('Show me the Day-0 checklist.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">01 · Day 0</div>
              <h3 className="h-app__art-h">Every credential. Every signer. Every permit.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Day 0 · Acme · 62 items</span><span>STATE</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Entity + EIN · payroll · insurance</span><span className="h-app__row-r h-app__row-r--ok">Done</span></div>
                <div className="h-app__row"><span className="h-app__row-l">TX reseller permit · transfer</span><span className="h-app__row-r h-app__row-r--warn">At risk</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Top-10 CEO-to-CEO calls</span><span className="h-app__row-r h-app__row-r--warn">Day 1–3</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Staff all-hands · script drafted</span><span className="h-app__row-r h-app__row-r--ok">Day 1</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">Risk flags live</span><span className="h-app__row-r h-app__row-r--total">1</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Day-0 checklist</div>
                <div className="h-app__foot-s">Generated from your DD data · state-specific · audit log</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>

          {/* 02 · 180-day plan */}
          <a className="h-app h-anim h-anim-d1" id="plan" href="#" onClick={(e) => { e.preventDefault(); seedChat('Build my 180-day plan.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">02 · 180-day plan</div>
              <h3 className="h-app__art-h">Six workstreams. Named owners. Weekly checkpoints.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Day 1–180 · Acme</span><span>DAY 21</span></div>
                <div className="h-app__tl">
                  <span className="h-app__tl-seg" data-state="done" />
                  <span className="h-app__tl-seg" data-state="active" />
                  <span className="h-app__tl-seg" />
                  <span className="h-app__tl-seg" />
                  <span className="h-app__tl-seg" />
                  <span className="h-app__tl-seg" />
                </div>
                <div className="h-app__tl-labels">
                  <span>D1</span><span>D30</span><span>D60</span><span>D90</span><span>D120</span><span>D180</span>
                </div>
                <div className="h-app__row"><span className="h-app__row-l">Pricing reset · 4 verticals</span><span className="h-app__row-r h-app__row-r--warn">D45</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Top-10 MSA formalization</span><span className="h-app__row-r h-app__row-r--warn">D60</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Branch ERP cutover</span><span className="h-app__row-r h-app__row-r--ok">D120</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">180-day runbook</div>
                <div className="h-app__foot-s">Generated from the LOI + QoE · one canvas · editable</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>

          {/* 03 · Retention */}
          <a className="h-app h-anim h-anim-d2" id="retention" href="#" onClick={(e) => { e.preventDefault(); seedChat('Retain the key people at Acme.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">03 · Retention</div>
              <h3 className="h-app__art-h">The four people who can't leave in the first 90 days.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Key-person map · Acme</span><span>RISK</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Marco · VP Sales · 22yr</span><span className="h-app__row-r h-app__row-r--warn">HIGH</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Nina · COO · 14yr</span><span className="h-app__row-r h-app__row-r--warn">MED</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Jennifer · Controller · 11yr</span><span className="h-app__row-r h-app__row-r--warn">MED</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Marco package · draft</span><span className="h-app__row-r h-app__row-r--total">$75K + 1.5%</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">Meetings scheduled</span><span className="h-app__row-r h-app__row-r--total">Thu 2pm</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Key-person retention</div>
                <div className="h-app__foot-s">Scripted opening + package structure + meeting booked</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>

          {/* 04 · Thesis tracking */}
          <a className="h-app h-anim h-anim-d3" id="thesis" href="#" onClick={(e) => { e.preventDefault(); seedChat('Am I on thesis at week 14?'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">04 · Thesis tracking</div>
              <h3 className="h-app__art-h">Are you on thesis? Yulia tells you every Monday.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Week 14 scorecard</span><span>VS THESIS</span></div>
                <div className="h-app__row"><span className="h-app__row-l">TTM EBITDA · thesis $11.0M</span><span className="h-app__row-r h-app__row-r--ok">$11.2M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Recurring mix · thesis 62%</span><span className="h-app__row-r h-app__row-r--ok">64%</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Top-10 concentration · ≤28%</span><span className="h-app__row-r h-app__row-r--warn">34%</span></div>
                <div className="h-app__row"><span className="h-app__row-l">FCCV · covenant 1.25×</span><span className="h-app__row-r h-app__row-r--ok">1.42×</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">On plan · Drift · Ahead</span><span className="h-app__row-r h-app__row-r--total">3 / 1 / 0</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Monday scorecard</div>
                <div className="h-app__foot-s">Drift flag on concentration → Yulia booked the Marco conversation for Wed.</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>
        </div>

        {/* RAIL */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Every post-close capability · one subscription</div>
            <h2 className="h-sect-h__t">What Yulia does the day you close. <em>All of it.</em></h2>
          </div>
        </div>

        <div className="h-rail" id="caps">
          {[
            { ico: '◫', t: 'Day-0 checklist',      s: '62-item checklist generated from DD findings.',                      meta: 'Live' },
            { ico: '◷', t: '180-day runbook',       s: '6 workstreams, named owners, weekly checkpoints.',                  meta: 'Live' },
            { ico: '⟟', t: 'Synergy tracker',      s: 'Committed vs. realized, per workstream, on the same canvas.',        meta: 'Live' },
            { ico: '◎', t: 'Thesis scorecard',     s: 'Weekly variance against the deal model.',                            meta: 'Preview' },
            { ico: '✎', t: 'Retention conversations', s: 'Scripted openings, packages, meeting booked.',                     meta: 'Try' },
            { ico: '⇌', t: 'AP consolidation',     s: 'Vendor MOU migration + duplicate-payment audit.',                    meta: 'Live' },
            { ico: '▦', t: 'ERP cutover',           s: 'Data-mapping, migration plan, rollback runbook.',                    meta: 'Preview' },
            { ico: '⎙', t: 'Document docket',      s: 'Every signed doc · version-locked · audit-logged.',                  meta: 'Live' },
            { ico: '⌕', t: 'Tuck-in radar',         s: 'Next acquisitions ranked against your platform thesis.',             meta: 'Live' },
          ].map((c) => (
            <div key={c.t} className="h-cap">
              <div className="h-cap__ico">{c.ico}</div>
              <div className="h-cap__t">{c.t}</div>
              <div className="h-cap__s">{c.s}</div>
              <div className="h-cap__meta"><span>Post-close</span><span>{c.meta}</span></div>
            </div>
          ))}
        </div>

        {/* CLAIM */}
        <section className="h-claim h-anim" id="claim">
          <div className="h-claim__l">
            <div className="h-claim__k">The economics</div>
            <h2 className="h-claim__h">Big-4 charges <em>$900K for a 180-day integration.</em></h2>
            <p className="h-claim__p">
              Deloitte, PwC, EY, KPMG — each quotes $650K–$1.2M for a 180-day post-close integration engagement. They bring a playbook and a team; Yulia builds the plan from your actual LOI, runs it week by week, and flags drift before it shows up in the P&L.
            </p>
          </div>
          <div className="h-claim__viz">
            {[
              { l: 'Big-4 integration',        w: '100%', v: '$900K · 180d', tone: 'big' },
              { l: 'Interim COO + consultant', w: '46%',  v: '$420K',        tone: 'big' },
              { l: 'Missed synergy (median)',  w: '62%',  v: '$560K',        tone: 'big' },
              { l: 'smbx.ai · Pro',            w: '3%',   v: '$199 / mo',    tone: 'small' },
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
            <span>Encrypted document docket</span>
            <span>Row-level audit log</span>
          </div>
        </div>

        {/* CTA */}
        <section className="h-cta h-anim" id="cta">
          <div className="h-cta__k">Start · No card</div>
          <h2 className="h-cta__h">You closed the deal. <em>Now the work begins.</em></h2>
          <p className="h-cta__s">
            Send Yulia the LOI, the QoE, and one sentence about your thesis. She returns a Day-0 checklist and a 180-day runbook inside two hours. The conversation starts in the chat pane on your left.
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
            <span>Day-0 in 2 hours</span>
            <span>180 days scripted</span>
            <span>Weekly scorecard</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}
