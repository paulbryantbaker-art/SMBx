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
  { id: 'hero',    label: 'Overview' },
  { id: 'try',     label: 'Add-back estimator' },
  { id: 'phases',  label: 'Five phases' },
  { id: 'caps',    label: 'Capabilities' },
  { id: 'claim',   label: 'Speed advantage' },
  { id: 'trust',   label: 'Trust' },
  { id: 'cta',     label: 'Start' },
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
    meta: 'Sell-side · Acme, Inc.',
    h1: "The CIM your client's getting Friday.",
    h1Em: 'Drafted by dinner Tuesday.',
    sub: (
      <>
        For <strong>LMM advisors, brokers, and M&amp;A intermediaries</strong>. Yulia reads the tax returns, defends the add-backs, drafts the CIM, builds the buyer list, and coordinates diligence. <strong>You keep the judgment. You run the deal.</strong> Narrated here with Acme, Inc. — $65M distributor, Phoenix HQ, 2nd-gen owner exploring exit.
      </>
    ),
    ctaLabel: 'Start the walkthrough',
    ctaSeed: 'I have a seller engagement starting.',
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

            <div className="h-today__demo">
              <div className="h-today__demo-k">{copy.demoK}</div>
              <div className="h-today__demo-bubble h-today__demo-bubble--me">{copy.demoMe}</div>
              <div className="h-today__demo-bubble">{copy.demoYulia}</div>
              <div className="h-today__demo-out">
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">+$1.80<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>M</span></div>
                  <div className="h-today__demo-out-l">Hidden EBITDA</div>
                </div>
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">$82.5<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>M</span></div>
                  <div className="h-today__demo-out-l">Target enterprise value</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ LIVE ADD-BACK ESTIMATOR ══ */}
        <AddbackEstimator />

        {/* ══ FIVE-PHASE ARC ══ */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">The arc · 14 weeks · 5 phases</div>
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

        {/* ══ CLAIM ══ */}
        <section className="h-claim h-anim" id="claim">
          <div className="h-claim__l">
            <div className="h-claim__k">The economics</div>
            <h2 className="h-claim__h">Priced against <em>the hour, not the outcome.</em></h2>
            <p className="h-claim__p">
              A sell-side engagement at a boutique bank: $750K–$2M, twelve months, success fees on top. On a $30M sale, that's another $1.2M if it closes. Yulia does the same work — reads the returns, writes the CIM, runs the process — for a flat monthly subscription. You keep the success fee.
            </p>
          </div>
          <div className="h-claim__viz">
            {[
              { l: 'Boutique M&A retainer',    w: '100%', v: '$1.4M · 12mo',    tone: 'big' },
              { l: 'Success fee (4% on $30M)', w: '82%',  v: '+$1.2M',          tone: 'big' },
              { l: 'Legal · tax · QoE',        w: '28%',  v: '$420K',           tone: 'big' },
              { l: 'smbx.ai',                  w: '7%',   v: '$4K / mo',        tone: 'small' },
            ].map((r) => (
              <div key={r.l} className="h-claim__row" data-tone={r.tone}>
                <span className="h-claim__row-l">{r.l}</span>
                <span className="h-claim__row-bar">
                  <span className="h-claim__row-fill" style={{ ['--w' as string]: r.w } as React.CSSProperties} />
                </span>
                <span className="h-claim__row-v">{r.v}</span>
              </div>
            ))}
          </div>
        </section>

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
