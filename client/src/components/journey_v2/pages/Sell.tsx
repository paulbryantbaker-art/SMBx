/**
 * Sell.tsx — rebuilt on the handoff v4 `.h-*` vocabulary (Home v1
 * design, Paul 2026-04-21). Retires the v3 editorial treatment
 * (sv-hero / sv-row / sell-editorial.css) in favor of the Grok
 * Apple App Store theme: dark hero + app-style card grid + rail +
 * claim bar chart + CTA.
 *
 * Acme, Inc. remains the running example across the page.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
import SectionNav, { type Section } from '../shell/SectionNav';

const SELL_SECTIONS: readonly Section[] = [
  { id: 'hero',       label: 'Overview' },
  { id: 'waterfall',  label: '12 deliverables' },
  { id: 'phases',     label: 'Engagement arc' },
  { id: 'caps',       label: 'Capabilities' },
  { id: 'claim',      label: 'Practice math' },
  { id: 'trust',      label: 'Trust' },
  { id: 'cta',        label: 'Start' },
];

/* ── Add-back estimator heuristics ── */
const REV_OPTS = ['$1–5M', '$5–10M', '$10–25M', '$25–50M', '$50M+'] as const;
const IND_OPTS = ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail', 'Other'] as const;
const OWN_OPTS = ['Full-time operator', 'Part-time', 'Team runs it'] as const;
const REV_RANGE: Record<string, [number, number]> = {
  '$1–5M': [0.35, 0.65],
  '$5–10M': [0.60, 1.20],
  '$10–25M': [1.10, 2.20],
  '$25–50M': [2.00, 3.80],
  '$50M+': [3.50, 6.50],
};
const IND_BIAS: Record<string, number> = {
  Services: 1.10, Manufacturing: 1.00, Healthcare: 1.15,
  Technology: 0.90, Construction: 1.05, Retail: 0.95, Other: 1.00,
};
const OWN_BIAS: Record<string, number> = {
  'Full-time operator': 1.25, 'Part-time': 1.05, 'Team runs it': 0.85,
};

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

type Voice = 'owner' | 'advisor';

type VoiceCopy = {
  meta: string;
  h1: string; h1Em: string;
  sub: ReactNode;
  ctaLabel: string;
  ctaSeed: string;
  demoK: string;
  demoMe: string;
  demoYulia: ReactNode;
};

const VOICE_COPY: Record<Voice, VoiceCopy> = {
  owner: {
    meta: 'Sell-side · My business',
    h1: 'The buyer will see six things.',
    h1Em: 'Fix five before they do.',
    sub: (
      <>
        For <strong>owners</strong> exploring exit. Yulia reads your tax returns, finds the add-backs your CPA missed, and tells you what a real buyer will see — <em>before</em> a broker tells you what to sell. Acme, Inc. is the running example below — $65M distributor, Phoenix HQ, 2nd-gen owner.
      </>
    ),
    ctaLabel: 'Start with my numbers',
    ctaSeed: "I'm thinking about selling my business.",
    demoK: 'Yulia · my readiness',
    demoMe: 'Read last three years of tax returns.',
    demoYulia: (
      <>
        Six defensible add-backs — <strong>+$1.80M</strong>. Normalized EBITDA <strong>$11.0M</strong>, 20% above what your CPA reports. At a 7.5× multiple that's <strong>+$13.5M</strong> of enterprise value you'd leave on the table.
      </>
    ),
  },
  advisor: {
    meta: 'Sell-side · Broker + advisor workflow',
    h1: 'A CIM takes 40 hours.',
    h1Em: 'Yulia drafts one in 30 minutes.',
    sub: (
      <>
        For <strong>LMM advisors, brokers, and M&amp;A intermediaries</strong>. Yulia writes the CIM, builds the buyer list, runs the data room, drafts the LOI — <strong>every deliverable a sell-side engagement ships</strong>. You keep the judgment, the relationship, and the success fee. Watch it work on Acme, Inc. to the right →
      </>
    ),
    ctaLabel: 'Start a mandate',
    ctaSeed: 'I have a seller engagement starting — walk me through the first week.',
    demoK: 'Yulia · live on Acme, Inc.',
    demoMe: 'Read these three tax returns.',
    demoYulia: (
      <>
        Done. Six defensible add-backs — <strong>+$1.80M</strong>. Normalized EBITDA <strong>$11.0M</strong>, 20% above what the CPA reports. At 7.5× that's <strong>+$13.5M</strong> of enterprise value.
      </>
    ),
  },
};

export default function Sell({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [voice, setVoice] = useState<Voice>('advisor');
  const copy = VOICE_COPY[voice];

  /* Reveal-on-scroll for .h-anim */
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
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
    return () => io.disconnect();
  }, []);

  /* CTA pointer: focus chat + pulse the chat column */
  const pulseChat = () => {
    const input = document.getElementById('chatInput') as HTMLInputElement | null;
    input?.focus();
    const chat = document.getElementById('chat');
    chat?.animate(
      [
        { boxShadow: '0 0 0 0 rgba(10,10,11,0.25)' },
        { boxShadow: '0 0 0 14px rgba(10,10,11,0)' },
      ],
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
      canvasKicker="smbx.ai / sell"
      canvasTitle="Sell a business"
      canvasBadge="Demo · Acme, Inc."
      chat={{
        title: 'Yulia',
        status: 'Sell-side · Acme, Inc.',
        pswLogo: 'A',
        pswName: 'Acme, Inc.',
        pswMeta: 'SELL · $65M · DEMO',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. This walkthrough uses <strong>Acme, Inc.</strong>, a $65M distributor in Phoenix. Scroll to see the arc — estimator, add-backs, readiness, CIM, competitive process, close.",
        reply: "Three numbers and I'll return a preliminary range in 30 minutes: <strong>industry</strong>, <strong>revenue</strong>, <strong>reported EBITDA</strong>.",
        chips: [] as const,
        placeholder: 'Ask Yulia anything about your business…',
        onSend,
        suggested: {
          kicker: 'Next',
          label: 'See the add-backs',
          onClick: () => document.getElementById('addbacks')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
      }}
    >
      <div id="sell" className="h-page" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>
        <SectionNav sections={SELL_SECTIONS} />

        {/* ══ HERO ══ */}
        <section className="h-today h-anim" id="hero">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <VoiceToggle voice={voice} onChange={setVoice} />
              <div className="h-today__meta">
                {copy.meta}
                <span className="h-today__meta-tag">Demo</span>
              </div>
              <h1 className="h-today__h">{copy.h1} <em>{copy.h1Em}</em></h1>
              <p className="h-today__sub">{copy.sub}</p>
              <div className="h-today__cta">
                <button className="h-today__btn" type="button" onClick={() => seedChat(copy.ctaSeed)}>
                  {copy.ctaLabel}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button className="h-today__btn h-today__btn--ghost" type="button" onClick={() => onNavigate('pricing')}>See pricing</button>
              </div>
            </div>

            <div className="h-today__demo" style={{ padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <CIMBuilder />
            </div>
          </div>
        </section>

        {/* ══ OVERDRIVE 1 · DELIVERABLE WATERFALL ══ */}
        <DeliverableWaterfall />

        {/* ══ FIVE-PHASE ARC (kept as supporting detail below waterfall) ══ */}
        <div className="h-sect-h" style={{ marginTop: 32 }}>
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Zooming in · the engagement arc</div>
            <h2 className="h-sect-h__t">Every sell-side step, <em>one canvas.</em></h2>
          </div>
        </div>

        <div className="h-apps" id="phases">
          {/* 01 · Add-backs */}
          <a className="h-app h-anim" id="addbacks" href="#" onClick={(e) => { e.preventDefault(); seedChat('Find my defensible add-backs.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">01 · Add-backs</div>
              <h3 className="h-app__art-h">Every dollar of hidden EBITDA, defended on the record.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Add-back schedule · Acme</span><span>$</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Above-market lease</span><span className="h-app__row-r h-app__row-r--ok">+$420K</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Discontinued branch</span><span className="h-app__row-r h-app__row-r--ok">+$640K</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Legal reserve</span><span className="h-app__row-r h-app__row-r--ok">+$310K</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Family on payroll</span><span className="h-app__row-r h-app__row-r--ok">+$180K</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">Defensible total</span><span className="h-app__row-r h-app__row-r--total">+$1.80M</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Defensible add-backs</div>
                <div className="h-app__foot-s">Reads three years of returns · 6 items · IRS-documented</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>

          {/* 02 · Readiness */}
          <a className="h-app h-anim h-anim-d1" id="readiness" href="#" onClick={(e) => { e.preventDefault(); seedChat('Score my business for readiness.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">02 · Readiness</div>
              <h3 className="h-app__art-h">Scored the way an IC actually scores it.</h3>
              <div className="h-app__donut">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="9" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#0A0A0B" strokeWidth="9"
                    strokeLinecap="round" strokeDasharray="263.9" strokeDashoffset="68" />
                </svg>
                <div className="h-app__donut-v">74</div>
              </div>
              <div className="h-app__preview" style={{ marginTop: 0 }}>
                <div className="h-app__bars">
                  {[
                    { l: 'Financials',   w: '91%', v: '9.1' },
                    { l: 'Revenue qual.', w: '86%', v: '8.6' },
                    { l: 'Management',   w: '74%', v: '7.4' },
                    { l: 'Owner dep.',   w: '54%', v: '5.4' },
                  ].map((b) => (
                    <div key={b.l} className="h-app__bar">
                      <span className="h-app__bar-l">{b.l}</span>
                      <span className="h-app__bar-t">
                        <span className="h-app__bar-f" style={{ ['--w' as string]: b.w } as React.CSSProperties} />
                      </span>
                      <span className="h-app__bar-v">{b.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Readiness score</div>
                <div className="h-app__foot-s">17 dims · two fixable yellows · 0.5–0.75× multiple lift</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>

          {/* 03 · CIM */}
          <a className="h-app h-anim h-anim-d2" id="cim" href="#" onClick={(e) => { e.preventDefault(); seedChat('Draft my CIM.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">03 · The CIM</div>
              <h3 className="h-app__art-h">A 32-page document that moves the multiple.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Preview · Acme · 32pp</span><span>—</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Executive summary</span><span className="h-app__row-r h-app__row-r--ok">Drafted</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Discipline mix (4 verticals)</span><span className="h-app__row-r h-app__row-r--ok">Drafted</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Financial exhibits</span><span className="h-app__row-r h-app__row-r--ok">Drafted</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Buyer universe &amp; outreach</span><span className="h-app__row-r h-app__row-r--warn">In flight</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">First draft to you</span><span className="h-app__row-r h-app__row-r--total">3–5 days</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">CIM drafting</div>
                <div className="h-app__foot-s">"SW anchor for national consolidation" — positioning moves the multiple 6× → 8×.</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>

          {/* 04 · Competitive process */}
          <a className="h-app h-anim h-anim-d3" id="process" href="#" onClick={(e) => { e.preventDefault(); seedChat('Run the process — find me buyers.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">04 · Competitive process</div>
              <h3 className="h-app__art-h">One buyer gives you a price. Four give you a market.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>IOIs · round 1 · 21 days</span><span>$</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Family office · all cash</span><span className="h-app__row-r h-app__row-r--ok">$82M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Strategic · 80/20 · LEAD</span><span className="h-app__row-r h-app__row-r--total">$91M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">PE roll-up · earnout</span><span className="h-app__row-r h-app__row-r--ok">$86M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Competing offer · passed</span><span className="h-app__row-r h-app__row-r--warn">$77M</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">18 → 4 IOIs in 21 days</span><span className="h-app__row-r h-app__row-r--total">Lead: $91M</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Competitive process</div>
                <div className="h-app__foot-s">Strategic's 20% rollover adds $14–18M at year 3 — total $107M vs. $82M all-cash today.</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>
        </div>

        {/* ══ CAPABILITY RAIL — every sell-side capability in one view ══ */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Every capability · one subscription</div>
            <h2 className="h-sect-h__t">What Yulia does for you. <em>All of it.</em></h2>
          </div>
        </div>

        <div className="h-rail" id="caps">
          {[
            { ico: '$', t: 'Add-back estimator',  s: 'Three inputs, preliminary hidden-EBITDA range in under a minute.',    meta: 'Try' },
            { ico: '▦', t: 'QoE Lite',             s: 'Pre-LOI quality-of-earnings analysis. 30 minutes, not 6 weeks.',       meta: 'Live' },
            { ico: '◎', t: 'Readiness score',     s: '17 dimensions a buyer or IC actually grades you on.',                    meta: 'Preview' },
            { ico: '▤', t: 'CIM drafting',        s: '32-page diligence pack. 3–5 days to first draft.',                       meta: 'Live' },
            { ico: '⌕', t: 'Buyer universe',       s: 'Strategic · PE · family office · mapped and scored on thesis.',          meta: 'Live' },
            { ico: '⇌', t: 'IOI / LOI compare',   s: 'Normalized terms side-by-side. Cash-equivalent math.',                    meta: 'Preview' },
            { ico: '⎙', t: 'Data room',            s: 'Buyer Q&A, watermarked, version-controlled, audit-logged.',              meta: 'Live' },
            { ico: '◷', t: 'Process timeline',    s: '14-week engagement plan with named owners and weekly checkpoints.',      meta: 'Live' },
            { ico: '✎', t: 'Negotiation prep',    s: 'Counter-term templates, after-tax NPV, earnout modeling.',                meta: 'Try' },
          ].map((c) => (
            <div key={c.t} className="h-cap">
              <div className="h-cap__ico">{c.ico}</div>
              <div className="h-cap__t">{c.t}</div>
              <div className="h-cap__s">{c.s}</div>
              <div className="h-cap__meta"><span>Sell-side</span><span>{c.meta}</span></div>
            </div>
          ))}
        </div>

        {/* ══ OVERDRIVE 3 · BROKER BEFORE/AFTER GANTT ══ */}
        <BrokerGantt />

        {/* ══ TRUST ══ */}
        <div className="h-trust" id="trust">
          <div className="h-trust__k">Under NDA by default</div>
          <div className="h-trust__list">
            <span>SOC 2 Type II</span>
            <span>Single-tenant inference</span>
            <span>No training on your data</span>
            <span>Buyer-masked data room</span>
            <span>Row-level audit log</span>
          </div>
        </div>

        {/* ══ CTA ══ */}
        <section className="h-cta h-anim" id="cta">
          <div className="h-cta__k">Start · No card</div>
          <h2 className="h-cta__h">Three numbers. <em>30 minutes to a first range.</em></h2>
          <p className="h-cta__s">
            Industry, revenue, reported EBITDA. That's what Yulia needs to return a preliminary value range, a defensible add-back list, and a readiness score. One line in the chat pane on your left.
          </p>
          <button className="h-cta__point" type="button" onClick={pulseChat}>
            <span className="h-cta__point-ar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            Start in the chat pane
            <span style={{ opacity: 0.65, fontWeight: 500 }}>Yulia is ready</span>
          </button>
          <div className="h-cta__meta">
            <span>30-min first range</span>
            <span>No card</span>
            <span>Under NDA</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AddbackEstimator — 3 inputs (revenue band, industry, owner role)
   → industry-pattern hidden-EBITDA range + 5.5× enterprise value.
   ═══════════════════════════════════════════════════════════════════ */
function AddbackEstimator() {
  const [rev, setRev] = useState('');
  const [ind, setInd] = useState('');
  const [own, setOwn] = useState('');
  const est = useMemo(() => {
    if (!rev || !ind || !own) return null;
    const rf = REV_RANGE[rev];
    const ib = IND_BIAS[ind];
    const ob = OWN_BIAS[own];
    return { low: rf[0] * ib * ob, high: rf[1] * ib * ob };
  }, [rev, ind, own]);

  return (
    <div className="h-try h-anim" id="try">
      <div className="h-try__head">
        <span className="h-try__k">Try it live</span>
        <span className="h-try__tag">3 inputs · 3 sec</span>
      </div>
      <h3 className="h-try__t">Add-back estimator. <em>How much is hiding in your financials?</em></h3>
      <p className="h-try__s">Pick three things. Yulia returns an industry-pattern estimate of defensible add-backs and the enterprise-value lift at 5–6×. A quick sanity check before the real analysis.</p>

      <div className="h-try__body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <PickBlock label="Annual revenue" options={REV_OPTS} value={rev} onChange={setRev} />
          <PickBlock label="Industry" options={IND_OPTS} value={ind} onChange={setInd} />
          <PickBlock label="Owner involvement" options={OWN_OPTS} value={own} onChange={setOwn} />
        </div>
        <div style={{
          marginTop: 18, padding: 20,
          background: est ? '#0A0A0B' : '#fff',
          color: est ? '#fff' : '#6B6B70',
          borderRadius: 14, minHeight: 110,
          border: est ? 'none' : '1px solid rgba(0,0,0,0.08)',
        }}>
          {est ? (
            <>
              <div style={{
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                opacity: 0.6,
              }}>Estimated hidden EBITDA</div>
              <div style={{
                fontFamily: 'Sora, sans-serif', fontWeight: 800,
                fontSize: 'clamp(32px, 4vw, 42px)',
                letterSpacing: '-0.03em', marginTop: 6,
              }}>${est.low.toFixed(2)}M – ${est.high.toFixed(2)}M</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
                At a 5–6× multiple, that's <strong>${(est.low * 5.5).toFixed(1)}M – ${(est.high * 5.5).toFixed(1)}M</strong> of enterprise value the CPA never surfaces.
              </div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 10 }}>
                Industry-pattern estimate. The real number is specific to your financials — a full QoE Lite runs in 30 minutes after you pick a plan.
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, fontStyle: 'italic', paddingTop: 4 }}>Pick all three inputs to see the estimate.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PickBlock<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: readonly T[];
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: '#6B6B70', marginBottom: 8,
      }}>{label}</div>
      <div style={{ display: 'grid', gap: 5 }}>
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              style={{
                padding: '8px 12px', textAlign: 'left',
                background: active ? '#0A0A0B' : '#fff',
                color: active ? '#fff' : '#1A1C1E',
                border: active ? 'none' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 10,
                fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 12.5,
                cursor: 'pointer', transition: 'background 150ms',
              }}
            >{o}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VoiceToggle — segmented persona switch at the top of the hero.
   Sell speaks to two personas: owner (principal) and advisor
   (practitioner). The toggle re-voices every piece of hero copy so both
   audiences feel addressed by the first slide.
   ══════════════════════════════════════════════════════════════════════ */
function VoiceToggle({ voice, onChange }: { voice: Voice; onChange: (v: Voice) => void }) {
  const opts: readonly { id: Voice; label: string }[] = [
    { id: 'advisor', label: 'I help clients sell' },
    { id: 'owner',   label: 'I want to sell my business' },
  ];
  return (
    <div
      role="tablist"
      aria-label="Who are you selling for?"
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        marginBottom: 18,
      }}
    >
      {opts.map(({ id, label }) => {
        const active = id === voice;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(id)}
            style={{
              padding: '8px 14px',
              background: active ? '#FFFFFF' : 'transparent',
              color: active ? '#0A0A0B' : 'rgba(255,255,255,0.72)',
              border: 'none',
              borderRadius: 9,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CIMBuilder — the CIM writes itself.
   Lives in the hero right column. Runs an autonomous ~18-second loop:
   pill → title → typed paragraph → KPI count-up → concentration chart →
   page footer. Clock in the top-right animates 00:00 → 30:00 over the
   full loop. Analyst-hours readout below the paper ticks 0 → 40.
   Pauses when not visible. Respects prefers-reduced-motion.
   ══════════════════════════════════════════════════════════════════════ */

const CIM_PARA =
  'Acme, Inc. is a Phoenix-based specialty distributor serving commercial HVAC contractors across Arizona, Nevada, and New Mexico. Revenue of $65M grew at a 14% CAGR over the trailing three years, with normalized EBITDA of $11.0M (16.9% margin) after defensible add-backs.';

type CimStage = 0 | 1 | 2 | 3 | 4 | 5;

function CIMBuilder() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<CimStage>(0);
  const [typed, setTyped] = useState('');
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  /* Pause when off-screen — cheap. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onMq);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => { io.disconnect(); mq.removeEventListener?.('change', onMq); };
  }, []);

  /* Stage driver. Each stage has a duration after which we advance. */
  useEffect(() => {
    if (reduced) { setStage(5); setTyped(CIM_PARA); return; }
    if (!visible) return;
    const durations: Record<CimStage, number> = {
      0: 600,   // paper settle
      1: 1000,  // pill + title fade
      2: 6200,  // paragraph typing
      3: 2000,  // KPI count-up
      4: 2000,  // chart bars
      5: 5000,  // hold, then loop
    };
    const t = setTimeout(() => {
      setStage((s) => ((s + 1) % 6) as CimStage);
      if (stage === 5) setTyped(''); // reset for next loop
    }, durations[stage]);
    return () => clearTimeout(t);
  }, [stage, visible, reduced]);

  /* Char-by-char typing during stage 2. */
  useEffect(() => {
    if (reduced || !visible || stage !== 2) return;
    let i = typed.length;
    if (i >= CIM_PARA.length) return;
    const id = setInterval(() => {
      i += 2; // 2 chars per tick for natural feel
      if (i >= CIM_PARA.length) { setTyped(CIM_PARA); clearInterval(id); }
      else setTyped(CIM_PARA.slice(0, i));
    }, 28);
    return () => clearInterval(id);
  }, [stage, visible, reduced, typed.length]);

  /* Clock + analyst-hours counters — tween toward the target as stages
     advance. We compute each independently from `stage` so the two
     readouts feel linked but smooth. */
  const totalProgress = Math.min(1, stage / 5);
  const clockMin = Math.floor(30 * totalProgress);
  const clockSec = Math.floor(((30 * totalProgress) % 1) * 60);
  const clockStr = `${String(clockMin).padStart(2, '0')}:${String(clockSec).padStart(2, '0')}`;
  const savedHrs = Math.round(40 * totalProgress);

  const svRev = stage >= 3 ? '$65M' : '$0';
  const svEbitda = stage >= 3 ? '$11.0M' : '$0';
  const svMargin = stage >= 3 ? '16.9%' : '0.0%';
  const svEmp = stage >= 3 ? '120' : '0';

  const chartHeights = stage >= 4 ? [62, 44, 36, 24] : [0, 0, 0, 0];

  const S = (needStage: CimStage): 'visible' | 'hidden' =>
    stage >= needStage ? 'visible' : 'hidden';

  return (
    <div className="sv-cim" ref={rootRef} aria-label="Yulia drafts a CIM page">
      <div className="sv-cim__kicker">
        <span>Yulia · drafting · Acme CIM</span>
        <span className="sv-cim__clock" aria-live="polite">{clockStr} / 30:00</span>
      </div>

      <div className="sv-cim__paper">
        <div className="sv-cim__bar" data-stage={S(1)}>
          <span>Acme, Inc. · Confidential · Sept 2026</span>
          <span className="sv-cim__bar-tag">SELL-SIDE</span>
        </div>

        <div className="sv-cim__pill" data-stage={S(1)}>Executive Summary</div>
        <h3 className="sv-cim__h" data-stage={S(1)}>Acme, Inc.</h3>
        <div className="sv-cim__sub" data-stage={S(1)}>Confidential Information Memorandum</div>

        <p className="sv-cim__para" data-stage={S(2)}>
          {typed}
          {stage === 2 && typed.length < CIM_PARA.length && <span className="sv-cim__caret" />}
        </p>

        <div className="sv-cim__kpi" data-stage={S(3)}>
          <div className="sv-cim__kpi-c">
            <div className="sv-cim__kpi-k">Revenue · ttm</div>
            <div className="sv-cim__kpi-v">{svRev}</div>
          </div>
          <div className="sv-cim__kpi-c">
            <div className="sv-cim__kpi-k">EBITDA · norm</div>
            <div className="sv-cim__kpi-v">{svEbitda}</div>
          </div>
          <div className="sv-cim__kpi-c">
            <div className="sv-cim__kpi-k">Margin</div>
            <div className="sv-cim__kpi-v">{svMargin}</div>
          </div>
          <div className="sv-cim__kpi-c">
            <div className="sv-cim__kpi-k">Employees</div>
            <div className="sv-cim__kpi-v">{svEmp}</div>
          </div>
        </div>

        <div data-stage={S(4)}>
          <div className="sv-cim__pill">Customer concentration · top 4</div>
          <div className="sv-cim__chart">
            {chartHeights.map((h, i) => (
              <span key={i} className="sv-cim__chart-b" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="sv-cim__chart-l">
            <span>Mesa HVAC</span><span>Sun Corp</span><span>DesertMech</span><span>Others</span>
          </div>
        </div>

        <div className="sv-cim__foot" data-stage={S(5)}>
          <span>Page 1 / 30</span>
          <span>Acme · Confidential</span>
        </div>
      </div>

      <div className="sv-cim__save">
        <span className="sv-cim__save-k">Analyst hours saved</span>
        <span className="sv-cim__save-v"><em>{savedHrs}</em>of 40</span>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   DeliverablePacks — 3-column infographic.
   Groups the 12 sell-side deliverables into three "packs" that map to
   the engagement arc: Diligence → Market → Closing. Each pack has an
   aggregate hours-saved readout. Scroll-triggered stagger; chips animate
   in with a document icon + green check flash when each "completes."
   Replaces the previous row-by-row list layout.
   ══════════════════════════════════════════════════════════════════════ */

type DKind = 'memo' | 'list' | 'model' | 'legal';
type Deliverable = { name: string; sub: string; before: string; after: string; kind: DKind };

type Pack = {
  num: '01' | '02' | '03';
  name: string;
  total: { before: string; after: string };
  items: readonly Deliverable[];
};

const WF_PACKS: readonly Pack[] = [
  {
    num: '01',
    name: 'Diligence pack',
    total: { before: '76 hrs', after: '13 min' },
    items: [
      { name: 'Add-back schedule',            sub: '3 yrs of returns → defensible normalizations', before: '8 hrs',  after: '30 sec', kind: 'model' },
      { name: 'QoE Lite',                     sub: 'Pre-LOI earnings quality, IRS-documented',     before: '24 hrs', after: '30 min', kind: 'model' },
      { name: '3-statement financial model',  sub: 'Operating model + DCF + sensitivity',          before: '24 hrs', after: '6 min',  kind: 'model' },
      { name: 'Valuation summary',            sub: 'Precedent comps, DCF, range of value',         before: '20 hrs', after: '3 min',  kind: 'model' },
    ],
  },
  {
    num: '02',
    name: 'Market pack',
    total: { before: '82 hrs', after: '19 min' },
    items: [
      { name: 'CIM · 32 pages',               sub: 'Investment-grade narrative + exhibits', before: '40 hrs', after: '30 min', kind: 'memo' },
      { name: 'One-page teaser',              sub: 'Anonymized, buyer-ready, branded',      before: '6 hrs',  after: '4 min',  kind: 'memo' },
      { name: 'Buyer list · 200+ targets',    sub: 'Strategic + financial scored on thesis',  before: '20 hrs', after: '5 min',  kind: 'list' },
      { name: 'Management presentation',       sub: '18-slide narrative with exhibits',       before: '16 hrs', after: '8 min',  kind: 'memo' },
    ],
  },
  {
    num: '03',
    name: 'Closing pack',
    total: { before: '38 hrs', after: '16 min' },
    items: [
      { name: 'Data room · 147 folders',       sub: 'NDA-gated, Q&A-tracked, audit-logged',  before: '10 hrs', after: '2 min',  kind: 'list' },
      { name: 'DD response kit',               sub: '147-item checklist with pre-drafted answers', before: '8 hrs',  after: '3 min',  kind: 'list' },
      { name: 'Bid compare + LOI draft',       sub: 'IOIs normalized · first-pass LOI',       before: '14 hrs', after: '8 min',  kind: 'legal' },
      { name: 'APA redline + closing binder',  sub: 'Markup against buyer draft + binder',    before: '6 hrs',  after: '3 min',  kind: 'legal' },
    ],
  },
];

function DeliverableWaterfall() {
  const ref = useRef<HTMLDivElement>(null);
  const [containerIn, setContainerIn] = useState(false);
  /* flat index → packIndex * 10 + itemIndex so each chip has a unique key */
  const [activated, setActivated] = useState<Set<string>>(new Set());

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setContainerIn(true);
      const full = new Set<string>();
      WF_PACKS.forEach((p, pi) => p.items.forEach((_, ii) => full.add(`${pi}:${ii}`)));
      setActivated(full);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          setContainerIn(true);
          /* Fan chips in: 320ms delay after container settles, then
             70ms between chips within a pack, 140ms between packs. */
          WF_PACKS.forEach((p, pi) => {
            p.items.forEach((_, ii) => {
              const delay = 340 + pi * 160 + ii * 70;
              setTimeout(() => {
                setActivated((prev) => {
                  const next = new Set(prev);
                  next.add(`${pi}:${ii}`);
                  return next;
                });
              }, delay);
            });
          });
          io.disconnect();
        });
      },
      { rootMargin: '-10% 0px', threshold: 0.1 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`sv-wf h-anim${containerIn ? ' in' : ''}`} ref={ref} id="waterfall">
      <div className="sv-wf__head">
        <div className="sv-wf__head-l">
          <div className="sv-wf__k">Every deliverable · one subscription</div>
          <h2 className="sv-wf__t">The three packs that win every mandate — <em>drafted, reviewed, shipped.</em></h2>
        </div>
        <div className="sv-wf__hero" aria-label="Analyst hours to Yulia minutes">
          <span className="sv-wf__hero-before">196<span className="sv-wf__hero-unit">h</span></span>
          <span className="sv-wf__hero-arrow">→</span>
          <span className="sv-wf__hero-after">48<span className="sv-wf__hero-unit">m</span></span>
        </div>
      </div>

      <div className="sv-wf__packs" role="list">
        {WF_PACKS.map((pack, pi) => (
          <div key={pack.num} className="sv-wf__pack" role="listitem">
            <div className="sv-wf__pack-h">
              <div>
                <div className="sv-wf__pack-num">Pack {pack.num}</div>
                <div className="sv-wf__pack-name">{pack.name}</div>
              </div>
              <div className="sv-wf__pack-meta">
                <strong>{pack.total.before}</strong> → <strong>{pack.total.after}</strong>
              </div>
            </div>

            {pack.items.map((d, ii) => (
              <div
                key={d.name}
                className={`sv-wf__chip${activated.has(`${pi}:${ii}`) ? ' in' : ''}`}
                data-kind={d.kind}
              >
                <div className="sv-wf__doc" aria-hidden="true">
                  <div className="sv-wf__doc-tick">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 12 10 18 20 6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="sv-wf__chip-name">{d.name}</div>
                  <div className="sv-wf__chip-sub">{d.sub}</div>
                </div>
                <div className="sv-wf__chip-time">
                  <span className="sv-wf__chip-before">{d.before}</span>
                  <span className="sv-wf__chip-after">{d.after}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="sv-wf__foot">
        <div className="sv-wf__foot-t">
          <strong>You still review every deliverable.</strong> Yulia drafts — you red-pen, tune the narrative, and sign off. Her output is the first draft your analyst would have given you, only it arrives before lunch instead of in 10 days.
        </div>
        <span className="sv-wf__foot-pill">3.4× capacity · same team</span>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   BrokerGantt — before/after timeline bars.
   14-week sell-side engagement visualized against a 4-week engagement
   with Yulia. Segments animate from left (scaleX) when block enters
   view. Same milestones shown in both rows so the eye maps them.
   ══════════════════════════════════════════════════════════════════════ */

type Seg = { label: string; start: number; len: number; mandate?: 1 | 2 | 3 };
const TODAY_SEGS: readonly Seg[] = [
  { label: 'Mandate',    start: 0,  len: 1 },
  { label: 'CIM',        start: 1,  len: 3 },
  { label: 'Buyer list', start: 4,  len: 2 },
  { label: 'Marketing',  start: 6,  len: 4 },
  { label: 'LOI',        start: 10, len: 2 },
  { label: 'DD',         start: 12, len: 2 },
];
/* Three mandates back-to-back, each ~4.6 weeks. Same phases, repeated. */
const mandate1: readonly Seg[] = [
  { label: 'Mandate', start: 0,    len: 0.3, mandate: 1 },
  { label: 'CIM',     start: 0.3,  len: 0.7, mandate: 1 },
  { label: 'Buyers',  start: 1.0,  len: 0.6, mandate: 1 },
  { label: 'Market',  start: 1.6,  len: 1.8, mandate: 1 },
  { label: 'LOI',     start: 3.4,  len: 0.5, mandate: 1 },
  { label: 'DD',      start: 3.9,  len: 0.7, mandate: 1 },
];
const mandate2: readonly Seg[] = mandate1.map((s) => ({ ...s, start: s.start + 4.7, mandate: 2 }));
const mandate3: readonly Seg[] = mandate1.map((s) => ({ ...s, start: s.start + 9.4, mandate: 3 }));
const YULIA_SEGS: readonly Seg[] = [...mandate1, ...mandate2, ...mandate3];

function BrokerGantt() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const TOTAL_WEEKS = 14;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } });
    }, { rootMargin: '-10% 0px', threshold: 0.1 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const pct = (w: number) => `${(w / TOTAL_WEEKS) * 100}%`;
  const minSeg = 7; /* small segments need room for the label */

  return (
    <section className="sv-gantt h-anim" ref={ref} id="claim">
      <div className="sv-gantt__head">
        <div className="sv-gantt__head-l">
          <div className="sv-gantt__k">Your practice math</div>
          <h2 className="sv-gantt__t">Same engagement. Same retainer. <em>Three mandates where one used to fit.</em></h2>
        </div>
      </div>

      {/* Today */}
      <div className={`sv-gantt__row${inView ? ' in' : ''}`} data-variant="today">
        <div className="sv-gantt__row-meta">
          <div className="sv-gantt__label">Today <em>· one mandate · 14 weeks · 240 analyst-hours</em></div>
          <div className="sv-gantt__metric">
            <span className="sv-gantt__metric-v">1</span>
            <span className="sv-gantt__metric-l">engagement</span>
          </div>
        </div>
        <div className="sv-gantt__track" role="img" aria-label="14-week engagement timeline">
          {TODAY_SEGS.map((s, i) => (
            <div
              key={i}
              className="sv-gantt__seg"
              style={{
                left: pct(s.start),
                width: `max(${minSeg}%, ${pct(s.len).replace('%', '')}%)`,
                transitionDelay: `${i * 90}ms`,
              }}
            ><span>{s.label}</span></div>
          ))}
        </div>
      </div>

      {/* With Yulia */}
      <div className={`sv-gantt__row${inView ? ' in' : ''}`} data-variant="yulia">
        <div className="sv-gantt__row-meta">
          <div className="sv-gantt__label">With Yulia <em>· three mandates · 14 weeks · 204 analyst-hours</em></div>
          <div className="sv-gantt__metric">
            <span className="sv-gantt__metric-v" style={{ color: '#C7616F' }}>3</span>
            <span className="sv-gantt__metric-l">engagements</span>
          </div>
        </div>
        <div className="sv-gantt__track" role="img" aria-label="Three back-to-back mandates in the same 14-week window with Yulia">
          {YULIA_SEGS.map((s, i) => (
            <div
              key={i}
              className="sv-gantt__seg"
              data-mandate={s.mandate}
              style={{
                left: pct(s.start),
                width: `calc(${pct(s.len).replace('%', '')}% - 2px)`,
                transitionDelay: `${520 + i * 38}ms`,
              }}
            ><span>{s.label}</span></div>
          ))}
          {/* Mandate boundary markers */}
          <div className="sv-gantt__divider" style={{ left: pct(4.7) }} />
          <div className="sv-gantt__divider" style={{ left: pct(9.4) }} />
          <div className="sv-gantt__mandate-tag" style={{ left: pct(0) }}>Mandate 1</div>
          <div className="sv-gantt__mandate-tag" style={{ left: pct(4.7) }}>Mandate 2</div>
          <div className="sv-gantt__mandate-tag" style={{ left: pct(9.4) }}>Mandate 3</div>
        </div>
      </div>

      <div className="sv-gantt__scale" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="sv-gantt__scale-t">W{i * 2 + 1}</span>
        ))}
      </div>

      <p className="sv-gantt__cap">
        <strong>The retainer stays. The success fee stays. The relationship stays.</strong> What changes is the clock. Your CIM, your buyer list, your process — drafted faster, ready for your red pen sooner, in your client's hands weeks earlier. Three mandates fit inside the window where one used to live. Same desk. Same team. Three times the book.
      </p>
    </section>
  );
}
