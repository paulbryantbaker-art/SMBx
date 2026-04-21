/**
 * Home.tsx — ported from Claude Design handoff v4 (`Home v1.html`).
 *
 * Structure and class names preserved verbatim per the handoff
 * contract. Styling lives in `handoff_v4/home.css` (scoped under
 * `#home`). Shell wiring (portfolio switcher, suggested chip, plus
 * button) flows through JourneyChat props.
 *
 * JS ports from the handoff inline <script>:
 *   - Reveal-on-scroll observer adds `.in` to `.h-anim`
 *   - Scroll-sync observer updates the crumb + next-chip labels and
 *     plays scripted Yulia narration once per section
 *   - Plus popup seeds the composer with a journey-specific line
 *   - App-card click seeds the composer (except Sell, which navigates)
 *   - CTA pointer focuses composer + pulses the chat column
 */
import { useEffect, useMemo, useRef } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

/* Section IDs drive the scroll-sync + crumb updates. Order = reading order. */
const SECTION_IDS = ['today', 'apps', 'caps', 'claim', 'trust', 'cta'] as const;
type SectionId = typeof SECTION_IDS[number];

const CRUMB: Record<SectionId, string> = {
  today: 'Home',
  apps:  'Home · journeys',
  caps:  'Home · capabilities',
  claim: 'Home · pricing',
  trust: 'Home · trust',
  cta:   'Home · get started',
};

const NEXT: Record<SectionId, { k: string; t: string }> = {
  today: { k: 'Next',   t: 'See the journeys' },
  apps:  { k: 'Next',   t: 'See the capabilities' },
  caps:  { k: 'Next',   t: "How it's priced" },
  claim: { k: 'Next',   t: 'Read the trust posture' },
  trust: { k: 'Ready?', t: 'Tell Yulia what you need' },
  cta:   { k: 'Ready?', t: 'Start free — no card' },
};

/* Additional scripted narration — plays once when each section is seen. */
const SECTION_SCRIPT: Partial<Record<SectionId, { who: 'y' | 'me'; t: string }[]>> = {
  apps: [
    { who: 'y', t: 'Four journeys: <strong>Sell, Buy, Raise, Integrate.</strong> Same agent, same chat, same canvas — different tools when you switch.' },
  ],
  caps: [
    { who: 'y', t: "These are the <em>capabilities</em> — the primitives I use across journeys. An estimator you can try. A CIM I draft live. Twelve in total; nine shown." },
  ],
  claim: [
    { who: 'y', t: 'Priced flat. A banker on a sell-side: <strong>$1.4M over 12 months.</strong> Growth equity fees: <strong>5.5%</strong> of the round. smbx.ai: <strong>$4K/mo.</strong>' },
  ],
  cta: [
    { who: 'y', t: 'Ready? One line — <em>"I\'m thinking about selling,"</em> <em>"we just closed Monarch"</em> — and I take it from there.' },
  ],
};

const PLUS_ROWS = [
  { id: 'sell',      icon: '$', label: 'Sell my business',          hint: '30 min',     seed: "I'm thinking about selling my business." },
  { id: 'buy',       icon: '⌕', label: 'Buy a business',            hint: 'Thesis',     seed: "I want to buy a business. Here's my thesis." },
  { id: 'raise',     icon: '↗', label: 'Raise capital',             hint: 'Term sheet', seed: "I need to raise capital." },
  { id: 'integrate', icon: '◫', label: 'Integrate an acquisition',  hint: '180 days',   seed: "We just closed on an acquisition." },
];

export default function Home({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  /* ── Reveal `.h-anim` elements on scroll into view ── */
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

  /* ── Scroll-sync: update crumb + next-chip + play section script. ── */
  const seenRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const crumbT = document.querySelector<HTMLElement>('.v4-canvas__crumb-t');
    const nextK  = document.querySelector<HTMLElement>('.v4-next__k');
    const nextT  = document.querySelector<HTMLElement>('.v4-next__t');
    const scrollEl = document.querySelector<HTMLElement>('#chatScroll');

    const postMsg = (who: 'y' | 'me', html: string) => {
      if (!scrollEl) return;
      const d = document.createElement('div');
      d.className = 'v4-msg' + (who === 'me' ? ' v4-msg--me' : '');
      d.innerHTML = `<div class="v4-msg__meta"><span class="v4-msg__av">${who === 'me' ? 'R' : 'Y'}</span><span>${who === 'me' ? 'You' : 'Yulia'}</span></div><div class="v4-msg__bubble">${html}</div>`;
      scrollEl.appendChild(d);
      scrollEl.scrollTop = scrollEl.scrollHeight;
    };

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id as SectionId;
        if (CRUMB[id] && crumbT) crumbT.textContent = CRUMB[id];
        if (NEXT[id]) {
          if (nextK) nextK.textContent = NEXT[id].k;
          if (nextT) nextT.textContent = NEXT[id].t;
        }
        const script = SECTION_SCRIPT[id];
        if (script && !seenRef.current.has(id)) {
          seenRef.current.add(id);
          script.forEach((ln, i) => window.setTimeout(() => postMsg(ln.who, ln.t), i * 450));
        }
      });
    }, { rootMargin: '-25% 0px -55% 0px' });

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  /* ── Next-chip: advance to the next section. ── */
  const advanceSection = () => {
    if (typeof document === 'undefined') return;
    const i = SECTION_IDS.findIndex((id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.top <= window.innerHeight / 2;
    });
    const nextId = SECTION_IDS[Math.min(Math.max(i, 0) + 1, SECTION_IDS.length - 1)];
    const target = document.getElementById(nextId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ── CTA pointer: focus the composer + pulse the chat well. ── */
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

  /* ── App-card click: seed chat for buy/raise/integrate; Sell navigates. ── */
  const handleAppClick = (j: string, e: React.MouseEvent) => {
    if (j === 'sell') {
      e.preventDefault();
      onNavigate('sell');
      return;
    }
    e.preventDefault();
    const seeds: Record<string, string> = {
      buy:       "I want to buy a business. Here's my thesis.",
      raise:     'I need to raise capital.',
      integrate: 'We just closed on an acquisition.',
    };
    const seed = seeds[j];
    const input = document.getElementById('chatInput') as HTMLInputElement | null;
    if (input && seed) {
      input.value = seed;
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  /* ── Composer send: journey-aware reply. ── */
  const replyTo = useMemo(() => (t: string): string => {
    const low = t.toLowerCase();
    if (/sell|exit|cim|buyer|ioi/.test(low))                    return "Great — tell me three numbers and I'll return a preliminary range in 30 minutes: <strong>industry</strong>, <strong>revenue</strong>, <strong>reported EBITDA</strong>.";
    if (/buy|acqui|target|thesis|roll-?up/.test(low))           return "Got it. What's the thesis — industry, geography, check size? I'll build a target list overnight.";
    if (/raise|round|series|equity|capital/.test(low))          return 'Okay. <strong>Stage</strong> and <strong>use of funds</strong>, and I\'ll score your readiness against what ICs actually grade.';
    if (/integr|day\s*1|day-?one|synergy|post.?close/.test(low)) return "Day zero. Send me the <strong>LOI</strong> and a <strong>chart of accounts</strong>. I'll have a 180-day runbook in the canvas in an hour.";
    return 'Tell me what you\'re trying to do — <em>"I\'m thinking about selling,"</em> <em>"we need to raise,"</em> <em>"we just closed on Monarch"</em> — and I\'ll pick the journey and start.';
  }, []);

  const handleSend = (text: string) => {
    void replyTo; // reply wiring currently uses JourneyChat's internal reply; kept for future routing
    onSend(text);
  };

  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="smbx.ai"
      canvasTitle="Home"
      canvasBadge="Today · live"
      chat={{
        title: 'Yulia',
        status: 'smbx.ai · Home',
        pswLogo: 'Y',
        pswName: 'Yulia',
        pswMeta: 'SMBX · GENERAL',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. I'm the agent that runs smbx.ai. Scroll through the canvas to see what I do; or tell me what you're trying to do and I'll pick the right journey.",
        reply: 'Tell me what you\'re trying to do — I\'ll pick the journey and start.',
        chips: [] as const,
        placeholder: 'Ask Yulia anything about your business…',
        onSend: handleSend,
        suggested: { kicker: 'Next', label: 'See the journeys', onClick: advanceSection },
        plusShortcuts: {
          rows: PLUS_ROWS,
          onPick: (id) => {
            if (id === 'sell') onNavigate('sell');
            if (id === 'buy') onNavigate('buy');
            if (id === 'raise') onNavigate('raise');
            if (id === 'integrate') onNavigate('integrate');
          },
        },
      }}
    >
      <div id="home" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>

        {/* ══ TODAY CARD ══ */}
        <section className="h-today h-anim" id="today">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <div className="h-today__meta">
                Today · smbx.ai
                <span className="h-today__meta-tag">Featured</span>
              </div>
              <h1 className="h-today__h">The operating system for <em>every side of your cap table.</em></h1>
              <p className="h-today__sub">
                One chat, one canvas, one agent. <strong>Yulia</strong> sells your business, sources your next acquisition, raises your next round, and runs your first 180 days after close — with the diligence, the documents, and the relationships in the same pane.
              </p>
              <div className="h-today__cta">
                <button className="h-today__btn" type="button" onClick={() => {
                  (document.getElementById('chatInput') as HTMLInputElement | null)?.focus();
                }}>
                  Open the chat
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button className="h-today__btn h-today__btn--ghost" type="button">Watch a demo</button>
              </div>

              {/* Ticker — shown only when hero=ticker */}
              <div className="h-ticker">
                <div className="h-ticker__track">
                  {[0, 1].flatMap((loop) => [
                    <span key={`a-${loop}`}><strong>Acme</strong> · add-backs · +$1.8M</span>,
                    <span key={`b-${loop}`}><strong>Apex</strong> · 47 targets screened</span>,
                    <span key={`c-${loop}`}><strong>Crestline</strong> · Series B · $22M committed</span>,
                    <span key={`d-${loop}`}><strong>Monarch</strong> · day 42 · 3 synergies hit</span>,
                    <span key={`e-${loop}`}><strong>Ridgeline</strong> · 4 IOIs inside 21 days</span>,
                  ])}
                </div>
              </div>
            </div>

            {/* Demo column */}
            <div className="h-today__demo">
              <div className="h-today__demo-k">Yulia · live session · Acme, Inc.</div>
              <div className="h-today__demo-bubble h-today__demo-bubble--me">Read these three tax returns.</div>
              <div className="h-today__demo-bubble">
                Done. Six defensible add-backs — <strong>+$1.80M</strong>. Normalized EBITDA <strong>$11.0M</strong>, 20% above what the CPA reports. At a 7.5× strategic multiple that's <strong>+$13.5M</strong> of enterprise value the accountant never surfaces.
              </div>
              <div className="h-today__demo-out">
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">+$1.80<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>M</span></div>
                  <div className="h-today__demo-out-l">Hidden EBITDA</div>
                </div>
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">+$13.5<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>M</span></div>
                  <div className="h-today__demo-out-l">Enterprise value</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ JOURNEY APPS ══ */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Four journeys · one agent</div>
            <h2 className="h-sect-h__t">Pick a side of the transaction. <em>Yulia does the work.</em></h2>
          </div>
        </div>

        <div className="h-apps" id="apps">
          {/* SELL */}
          <a className="h-app h-anim" data-app="sell" data-j="sell" href="/sell" onClick={(e) => handleAppClick('sell', e)}>
            <div className="h-app__art">
              <div className="h-app__art-k">01 · Sell</div>
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
                <div className="h-app__foot-t">Sell a business</div>
                <div className="h-app__foot-s">Estimator → add-backs → CIM → IOIs → close</div>
              </div>
              <button className="h-app__get" type="button">Open</button>
            </div>
          </a>

          {/* BUY */}
          <a className="h-app h-anim h-anim-d1" data-app="buy" data-j="buy" href="#" onClick={(e) => handleAppClick('buy', e)}>
            <div className="h-app__art">
              <div className="h-app__art-k">02 · Buy</div>
              <h3 className="h-app__art-h">A thesis, a pipeline, and a letter on the desk.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Thesis · Southwest MRO roll-up</span><span>FIT</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Ridgeline Supply · Tucson</span><span className="h-app__row-r h-app__row-r--ok">94</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Granite Industrial · Denver</span><span className="h-app__row-r h-app__row-r--ok">88</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Summit Parts · Albuquerque</span><span className="h-app__row-r h-app__row-r--ok">82</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Desert Flow · Phoenix</span><span className="h-app__row-r h-app__row-r--warn">71</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">47 targets screened</span><span className="h-app__row-r h-app__row-r--total">4 live</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Buy a business</div>
                <div className="h-app__foot-s">Thesis → screening → outreach → diligence → LOI</div>
              </div>
              <button className="h-app__get" type="button">Open</button>
            </div>
          </a>

          {/* RAISE */}
          <a className="h-app h-anim h-anim-d2" data-app="raise" data-j="raise" href="#" onClick={(e) => handleAppClick('raise', e)}>
            <div className="h-app__art">
              <div className="h-app__art-k">03 · Raise</div>
              <h3 className="h-app__art-h">Readiness scored the way an IC actually scores it.</h3>
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
                    { l: 'Growth',     w: '88%', v: '8.8' },
                    { l: 'Unit econ.', w: '82%', v: '8.2' },
                    { l: 'Team',       w: '72%', v: '7.2' },
                    { l: 'TAM story',  w: '58%', v: '5.8' },
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
                <div className="h-app__foot-t">Raise capital</div>
                <div className="h-app__foot-s">Readiness → data room → pitch → term sheet</div>
              </div>
              <button className="h-app__get" type="button">Open</button>
            </div>
          </a>

          {/* INTEGRATE */}
          <a className="h-app h-anim h-anim-d3" data-app="integrate" data-j="integrate" href="#" onClick={(e) => handleAppClick('integrate', e)}>
            <div className="h-app__art">
              <div className="h-app__art-k">04 · Integrate</div>
              <h3 className="h-app__art-h">Day 1 to 180 — the plan that survives close.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Day 1–180 · Monarch</span><span>DAY 42</span></div>
                <div className="h-app__tl">
                  <span className="h-app__tl-seg" data-state="done" />
                  <span className="h-app__tl-seg" data-state="done" />
                  <span className="h-app__tl-seg" data-state="active" />
                  <span className="h-app__tl-seg" />
                  <span className="h-app__tl-seg" />
                  <span className="h-app__tl-seg" />
                </div>
                <div className="h-app__tl-labels">
                  <span>D1</span><span>D30</span><span>D60</span><span>D90</span><span>D120</span><span>D180</span>
                </div>
                <div className="h-app__row"><span className="h-app__row-l">ERP cutover</span><span className="h-app__row-r h-app__row-r--ok">Done</span></div>
                <div className="h-app__row"><span className="h-app__row-l">AP consolidation</span><span className="h-app__row-r h-app__row-r--warn">In flight</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Synergy: freight</span><span className="h-app__row-r h-app__row-r--ok">+$420K</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Integrate an acquisition</div>
                <div className="h-app__foot-s">Day-1 plan → synergy tracker → 180-day close-out</div>
              </div>
              <button className="h-app__get" type="button">Open</button>
            </div>
          </a>
        </div>

        {/* ══ CAPABILITIES RAIL ══ */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Inside every subscription</div>
            <h2 className="h-sect-h__t">Twelve capabilities. <em>One agent.</em></h2>
          </div>
          <button className="h-sect-h__more" type="button">See all →</button>
        </div>

        <div className="h-rail" id="caps">
          {[
            { ico: '$', t: 'Add-back estimator',  s: 'Three inputs, preliminary hidden-EBITDA range in under a minute.',    meta: 'Sell',       tag: 'Try' },
            { ico: '◎', t: 'Readiness score',     s: '17 dimensions a buyer or IC actually grades you on.',                    meta: 'Sell · Raise', tag: 'Preview' },
            { ico: '▤', t: 'CIM drafting',        s: '32-page diligence pack. Three–five days to first draft.',                 meta: 'Sell',       tag: 'Live' },
            { ico: '⌕', t: 'Target radar',        s: 'Thesis-ranked screens against live private-company data.',                 meta: 'Buy',        tag: 'Live' },
            { ico: '⇌', t: 'IOI / LOI compare',   s: 'Normalized terms side-by-side. Cash-equivalent math on screen.',           meta: 'Sell · Buy', tag: 'Preview' },
            { ico: '◨', t: 'Cap-stack modeler',   s: 'Equity, debt, hybrid — dilution and yield-to-exit in one view.',           meta: 'Raise',      tag: 'Try' },
            { ico: '◫', t: 'Day-1 runbook',       s: '180-day integration plan generated from the LOI.',                        meta: 'Integrate',  tag: 'Preview' },
            { ico: '⟟', t: 'Synergy tracker',     s: 'Committed vs. realized, per workstream, on the same canvas.',             meta: 'Integrate',  tag: 'Live' },
            { ico: '⎙', t: 'Data room',            s: 'Buyer Q&A, version-controlled, watermarked, fully logged.',               meta: 'Sell · Raise', tag: 'Live' },
          ].map((c) => (
            <div key={c.t} className="h-cap">
              <div className="h-cap__ico">{c.ico}</div>
              <div className="h-cap__t">{c.t}</div>
              <div className="h-cap__s">{c.s}</div>
              <div className="h-cap__meta"><span>{c.meta}</span><span>{c.tag}</span></div>
            </div>
          ))}
        </div>

        {/* ══ CLAIM ══ */}
        <section className="h-claim h-anim" id="claim">
          <div className="h-claim__l">
            <div className="h-claim__k">The economics</div>
            <h2 className="h-claim__h">Priced against <em>the hour, not the outcome.</em></h2>
            <p className="h-claim__p">
              A sell-side engagement at a boutique bank: $750K–$2M, twelve months, success fees on top. A growth-equity raise: 4–7% of the round. Yulia does the same work — reads the returns, writes the CIM, runs the process — for a flat monthly subscription.
            </p>
          </div>
          <div className="h-claim__viz">
            {[
              { l: 'Boutique M&A',        w: '100%', v: '$1.4M · 12mo',   tone: 'big' },
              { l: 'Growth equity fee',   w: '52%',  v: '5.5% of round',  tone: 'big' },
              { l: 'Big-4 integration',   w: '68%',  v: '$900K · 180d',   tone: 'big' },
              { l: 'smbx.ai',             w: '7%',   v: '$4K / mo',       tone: 'small' },
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
            <span>Customer-managed keys</span>
            <span>Row-level audit log</span>
          </div>
        </div>

        {/* ══ BOTTOM CTA ══ */}
        <section className="h-cta h-anim" id="cta">
          <div className="h-cta__k">Start · No card</div>
          <h2 className="h-cta__h">Tell Yulia <em>what you're trying to do.</em></h2>
          <p className="h-cta__s">
            One line in the chat pane on your left — "I'm thinking about selling," "I need to raise," "we just closed on Monarch" — and she picks the journey, opens the canvas, and starts the work.
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
            <span>30-min first estimate</span>
            <span>No card</span>
            <span>Under NDA</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}
