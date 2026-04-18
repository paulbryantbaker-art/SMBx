/**
 * Glass Grok · Home (/)
 * ─────────────────────────────────────────────────────────────────────
 * Desktop: app shell (sidebar + topbar) + 2-col hero (text left, peek
 * stack right) + 3 feature cards with geometric monochrome visuals.
 * Mobile: centered chat-first hero, unchanged.
 *
 * Spec sources:
 *  - Glass Grok/Grok Glass Journey.html (mobile hero)
 *  - Glass Grok desktop spec (this session — 2-col + peek + features)
 *  - SMBX_SITE_COPY.md (page 1)
 */

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import '../glass.css';
import { Page, type JourneyTab } from '../primitives';
import { PeekStack, useTypewriter } from '../mockups';

/* ─── Rotating placeholder hints ────────────────────────────────────── */
const ROTATING_HINTS = [
  'Screen a deal in 90 seconds…',
  'Find the add-backs hiding in your financials…',
  'Draft a CIM from a conversation…',
  'Model an SBA structure under SOP 50 10 8…',
  'Build your LP update in 20 minutes…',
  'What’s this business actually worth…',
];

/* ─── Plus-button journey shortcuts ───────────────────────────────────
   Clicking an option prefills the chat input with a concrete prompt the
   user can see, edit, and send. They're help texts, not navigation —
   visitor enters a Yulia conversation with real context. */
type Journey = 'sell' | 'buy' | 'raise' | 'integrate';
const SHORTCUTS: { label: string; journey: Journey; prompt: string }[] = [
  { label: 'Sell my business', journey: 'sell',      prompt: 'I\u2019m thinking about selling my business. Walk me through what it might be worth and what I\u2019d keep after tax.' },
  { label: 'Buy a business',   journey: 'buy',       prompt: 'I\u2019m evaluating a business to acquire. Score it for me on revenue quality, margins, owner dependency, and concentration.' },
  { label: 'Raise capital',    journey: 'raise',     prompt: 'I need to raise capital. Help me model an SBA structure with senior debt, mezz, and seller notes.' },
  { label: 'Just acquired',    journey: 'integrate', prompt: 'I just acquired a business. Help me build a Day-1 integration plan \u2014 payroll, systems, first 90 days.' },
];

/* ─── Chat starters — each card prefills Yulia with a real prompt ─────
   Four entry points, one per journey. These replace static feature cards:
   every "What Yulia does" card is an invitation to actually do it. */
const CHAT_STARTERS: {
  label: string;
  prompt: string;
  teaser: string;
  journey: Journey;
}[] = [
  {
    label: 'I want to sell',
    prompt: 'I’m thinking about selling my business. Walk me through what it might be worth and what I’d keep after tax.',
    teaser: 'Valuation range, add-backs, after-tax proceeds — in one conversation.',
    journey: 'sell',
  },
  {
    label: 'I want to buy',
    prompt: 'I’m evaluating a business to acquire. Score it for me on revenue quality, margins, owner dependency, and concentration.',
    teaser: 'Score any deal in 90 seconds on seven dimensions. Pursue or pass.',
    journey: 'buy',
  },
  {
    label: 'I need capital',
    prompt: 'I need to raise capital. Help me model an SBA structure with senior debt, mezz, and seller notes.',
    teaser: 'SOP 50 10 8 capital stacks modeled against current rules.',
    journey: 'raise',
  },
  {
    label: 'I just acquired',
    prompt: 'I just acquired a business. Help me build a Day-1 integration plan — payroll, systems, first 90 days.',
    teaser: 'Day 1 after the wire. Checklist, cash model, owner transition.',
    journey: 'integrate',
  },
];

interface HomeProps {
  user: { display_name?: string | null; email?: string | null } | null;
  authLoading: boolean;
  onSend: (text: string) => void;
  onNavigateJourney: (journey: Journey) => void;
}

export default function Home({ user, authLoading, onSend, onNavigateJourney }: HomeProps) {
  const [text, setText] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (text) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => setHintIndex(i => (i + 1) % ROTATING_HINTS.length), 4000);
    return () => window.clearInterval(id);
  }, [text]);

  useEffect(() => {
    if (!popupOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setPopupOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setPopupOpen(false); };
    window.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('mousedown', onDocClick); window.removeEventListener('keydown', onKey); };
  }, [popupOpen]);

  const submit = (raw: string) => {
    const msg = raw.trim();
    if (!msg) return;
    setText('');
    onSend(msg);
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); submit(text); };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(text); }
  };

  const firstName = user?.display_name?.split(' ')[0];
  const onNavigate = (dest: JourneyTab) => {
    if (dest === 'home') return;
    if (dest === 'sell' || dest === 'buy' || dest === 'raise' || dest === 'integrate') {
      onNavigateJourney(dest);
      return;
    }
    /* pricing / how-it-works / enterprise — open via chat for now */
    onSend(`Tell me about ${dest}.`);
  };

  const heroEyebrow = 'Deal intelligence platform';
  const isMarketing = !user || authLoading;
  const marketingH1 = 'Your new AI deal team.';
  const loggedInH1 = `Welcome back${firstName ? `, ${firstName}` : ''}.`;
  const heroTag = user && !authLoading
    ? 'Pick up where you left off. Tell Yulia what you\u2019re working on.'
    : 'Valuations. CIMs. Deal scoring. Financial models. Due diligence. LOIs. Everything an investment bank delivers \u2014 without the retainer.';

  /* ─── Page choreography ─────────────────────────────────────────────
     stage 0: H1 typewriting; everything else hidden
     stage 1: H1 done, subtag + chat fade in together
     stage 2: peek stack + trust bar fade in; chat pill pulses via CSS
     stage 3: valuation demo section fades up
     stage 4: chat starters section fades up
     Each stage: opacity 0 + 24px translateY → 0, 560ms ease-spring.
     Total choreography ~2.6s. Gives the visitor a deliberate tour of
     the page instead of one all-at-once arrival.

     Logged-in users skip straight to stage 4 — typewriter + cascade
     is a marketing flourish, not a dashboard one.
     Respects prefers-reduced-motion. */
  const [heroStage, setHeroStage] = useState<0 | 1 | 2 | 3 | 4>(isMarketing ? 0 : 4);
  /* Typewriter at 22 cps → "Your new AI deal team." (22 chars) runs ~1s
     — deliberate enough to read without feeling slow. */
  const { shown: typedH1, done: typingDone } = useTypewriter(marketingH1, isMarketing, 22);

  /* Ref guard so the 4-timer cascade only schedules once. Previously
     heroStage was in the effect deps, which meant setting stage 1
     retriggered the effect, which cleaned up timers 2/3/4 before they
     could fire — only stage 1 landed and the page stayed half-loaded. */
  const cascadeStartedRef = useRef(false);
  useEffect(() => {
    if (!isMarketing) { setHeroStage(4); return; }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setHeroStage(4); return; }
    if (typingDone && !cascadeStartedRef.current) {
      cascadeStartedRef.current = true;
      /* Cinematic pacing: 900ms gap between major beats. Each reveal's
         900ms transition overlaps the next stage's start by ~200ms, so
         the page feels continuous — never "arrived and waiting". */
      const timers = [
        window.setTimeout(() => setHeroStage(1), 300),    // subtag + chat
        window.setTimeout(() => setHeroStage(2), 1200),   // peek + trust + pulse
        window.setTimeout(() => setHeroStage(3), 2100),   // valuation demo section
        window.setTimeout(() => setHeroStage(4), 3000),   // chat starters section
      ];
      return () => { timers.forEach(id => window.clearTimeout(id)); };
    }
  }, [isMarketing, typingDone]);

  /* Stage-driven style helper. Cinematic reveal: opacity + 32px lift +
     slight scale from 0.985 (gives a subtle depth-of-field feel without
     reading as 3D). 900ms duration on cubic-bezier(0.19, 1, 0.22, 1) —
     easeOutExpo, the classic luxurious deceleration curve. Long enough
     to read as deliberate, short enough that the cascade totals ~4s. */
  const revealStyle = (threshold: 1 | 2 | 3 | 4): React.CSSProperties => ({
    opacity: heroStage >= threshold ? 1 : 0,
    transform: heroStage >= threshold ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.985)',
    transition:
      'opacity 900ms cubic-bezier(0.19, 1, 0.22, 1), ' +
      'transform 900ms cubic-bezier(0.19, 1, 0.22, 1)',
    willChange: heroStage >= threshold ? 'auto' : 'opacity, transform',
  });

  return (
    <Page
      active="home"
      onNavigate={onNavigate}
      onStartFree={() => inputRef.current?.focus()}
      onSignIn={() => onSend('Sign me in.')}
    >
      {/* ═════ Hero — 2-col desktop, stacked mobile ═════ */}
      <section
        className="gg-enter"
        style={{
          position: 'relative',
          padding: 'clamp(56px, 8vw, 120px) clamp(20px, 4vw, 88px) clamp(48px, 6vw, 88px)',
          maxWidth: 1680,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div className="gg-grid-bg" />
        <div className="gg-hero-bg" />

        <div className="gg-two-col" style={{ alignItems: 'center', position: 'relative', zIndex: 1, minHeight: 480 }}>
          {/* ── Left: copy + chat ── */}
          <div>
            <div className="gg-eyebrow" style={{ marginBottom: 24 }}>{heroEyebrow}</div>
            <h1 className="gg-h1" style={{ marginBottom: 28 }}>
              {isMarketing ? (
                <>
                  {typedH1}
                  {!typingDone && <span className="gg-caret" aria-hidden="true" />}
                </>
              ) : (
                loggedInH1
              )}
            </h1>
            <p
              className="gg-body gg-body--lead"
              style={{ marginBottom: 40, maxWidth: 560, ...revealStyle(1) }}
            >
              {heroTag}
            </p>

            {/* Chat input */}
            <form onSubmit={onSubmit} style={{ position: 'relative', maxWidth: 560, ...revealStyle(1) }}>
              <div className={`gg-chat${isMarketing ? ' gg-chat--hero-pulse' : ''}`} style={{ marginBottom: 24 }}>
                <button
                  type="button"
                  className="gg-chat__plus"
                  aria-label="Journey shortcuts"
                  aria-expanded={popupOpen}
                  onClick={() => setPopupOpen(v => !v)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <input
                  ref={inputRef}
                  className="gg-chat__field"
                  type="text"
                  value={text}
                  placeholder={ROTATING_HINTS[hintIndex]}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoComplete="off"
                  spellCheck="false"
                />
                <button type="submit" className="gg-chat__send" aria-label="Send" disabled={!text.trim()}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </button>
              </div>

              {popupOpen && (
                <div
                  ref={popupRef}
                  className="gg-glass-strong"
                  style={{
                    position: 'absolute', top: '100%', left: 0,
                    marginTop: -12, padding: 8,
                    borderRadius: 'var(--gg-r-card)',
                    minWidth: 260, zIndex: 40,
                    animation: 'gg-fade-up 200ms var(--gg-ease-spring) both',
                  }}
                  role="menu"
                >
                  {SHORTCUTS.map(s => (
                    <button
                      key={s.journey}
                      type="button"
                      role="menuitem"
                      onClick={() => { setPopupOpen(false); setText(s.prompt); inputRef.current?.focus(); }}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '10px 12px',
                        border: 0, background: 'transparent', cursor: 'pointer',
                        fontFamily: 'var(--gg-body)',
                        fontSize: 14, fontWeight: 600,
                        color: 'var(--gg-text-primary)',
                        borderRadius: 'var(--gg-r-btn)',
                        transition: 'background var(--gg-t-feedback) var(--gg-ease-snap)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--gg-accent-fill)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Trust bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              fontFamily: 'var(--gg-display)',
              fontSize: 11, fontWeight: 600,
              color: 'var(--gg-text-faint)', letterSpacing: '0.04em',
              ...revealStyle(2),
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--gg-text-muted)',
              }}>Built on</span>
              <span style={{ color: 'var(--gg-text-muted)', fontFamily: 'var(--gg-body)', fontWeight: 500 }}>
                U.S. Census &middot; BLS &middot; FRED &middot; SEC EDGAR &middot; SBA &middot; IRS SOI
              </span>
            </div>
          </div>

          {/* ── Right: product peek — desktop only ── */}
          <div className="gg-desktop-only" style={revealStyle(2)}>
            <PeekStack />
          </div>
        </div>
      </section>

      {/* ═════ Live valuation demo — interactive, tint band
           Wrapper div fades + lifts at stage 3. Inner section stagger-
           reveals its own children (label, headline, sub, grid) on a
           120ms cadence so the section lands as a sequence, not a block. */}
      <div style={{ background: 'var(--gg-bg-card)', width: '100%', ...revealStyle(3) }}>
        <section
          className={`gg-stagger-children${heroStage >= 3 ? ' gg-stagger-children--in' : ''}`}
          style={{
            padding: 'clamp(40px, 5vw, 96px) clamp(20px, 4vw, 88px) clamp(40px, 5vw, 96px)',
            maxWidth: 1680, margin: '0 auto', width: '100%', boxSizing: 'border-box',
          }}
        >
          <ValuationDemo onSend={onSend} />
        </section>
      </div>

      {/* ═════ Chat starters — prefill Yulia with a real question ═════
           revealStyle(4) — fades up at stage 4, the final beat.
           Stagger-reveals internal children on the same 120ms cadence. */}
      <section
        className={`gg-stagger-children${heroStage >= 4 ? ' gg-stagger-children--in' : ''}`}
        style={{
          padding: 'clamp(40px, 5vw, 80px) clamp(20px, 4vw, 88px) clamp(72px, 8vw, 120px)',
          maxWidth: 1680, margin: '0 auto', width: '100%', boxSizing: 'border-box',
          ...revealStyle(4),
        }}
      >
        <div className="gg-label" style={{ marginBottom: 14 }}>Start a conversation</div>
        <h2 className="gg-h2" style={{ marginBottom: 10, letterSpacing: '-0.02em' }}>
          Or just ask Yulia.
        </h2>
        <p className="gg-body gg-body--sub" style={{ marginBottom: 36, maxWidth: 640 }}>
          Pick any thread. She picks up where you leave off — with your numbers, your deal, your context.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {CHAT_STARTERS.map(s => (
            <ChatStarter key={s.prompt} {...s} onSend={onSend} />
          ))}
        </div>
      </section>
    </Page>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VALUATION DEMO — live interactive. Three inputs, live range output,
   handoff to Yulia chat. The point: the visitor does the thing Yulia
   does, feels the product, and exits the calculator INTO a conversation
   with real context prefilled. Not a brochure — a demo.
   ══════════════════════════════════════════════════════════════════════ */

const REVENUE_BANDS: { label: string; mid: number }[] = [
  { label: '$1M–$5M',   mid: 3_000_000 },
  { label: '$5M–$10M',  mid: 7_500_000 },
  { label: '$10M–$25M', mid: 17_500_000 },
  { label: '$25M–$50M', mid: 37_500_000 },
  { label: '$50M+',     mid: 75_000_000 },
];
const INDUSTRIES = ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail', 'Other'] as const;
/* Industry multiple ranges — EBITDA multiples by sector, lightly
   compressed vs. institutional comps to avoid overclaiming on home. */
const INDUSTRY_MULT: Record<string, [number, number]> = {
  Services:      [4.5, 6.5],
  Manufacturing: [5.0, 7.0],
  Healthcare:    [6.0, 8.5],
  Technology:    [6.5, 10.0],
  Construction:  [3.5, 5.0],
  Retail:        [3.0, 5.0],
  Other:         [4.0, 6.0],
};
const MARGIN_BANDS: { label: string; pct: number }[] = [
  { label: 'Thin (<10%)',    pct: 0.07 },
  { label: 'Healthy (10–20%)', pct: 0.14 },
  { label: 'Strong (20%+)',  pct: 0.24 },
];

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

function ValuationDemo({ onSend }: { onSend: (text: string) => void }) {
  const [revIdx,    setRevIdx]    = useState<number | null>(null);
  const [industry,  setIndustry]  = useState<string | null>(null);
  const [marginIdx, setMarginIdx] = useState<number | null>(null);

  const result = useMemo(() => {
    if (revIdx === null || industry === null || marginIdx === null) return null;
    const rev    = REVENUE_BANDS[revIdx].mid;
    const margin = MARGIN_BANDS[marginIdx].pct;
    const [mLow, mHigh] = INDUSTRY_MULT[industry];
    const ebitda = rev * margin;
    return {
      ebitda,
      evLow:  ebitda * mLow,
      evHigh: ebitda * mHigh,
      multLow: mLow,
      multHigh: mHigh,
    };
  }, [revIdx, industry, marginIdx]);

  const handoff = () => {
    if (revIdx === null || industry === null || marginIdx === null || !result) return;
    const rev = REVENUE_BANDS[revIdx].label;
    const marginLabel = MARGIN_BANDS[marginIdx].label.toLowerCase();
    onSend(
      `I ran the home-page valuation with revenue ${rev}, industry ${industry}, and ${marginLabel} EBITDA margin. ` +
      `It landed around ${fmtMoney(result.evLow)}–${fmtMoney(result.evHigh)}. ` +
      `Can you run a real valuation against my actual financials?`
    );
  };

  return (
    <>
      <div className="gg-label" style={{ marginBottom: 14 }}>Try it — live</div>
      <h2 className="gg-h2" style={{ marginBottom: 10, letterSpacing: '-0.02em' }}>
        What’s your business actually worth?
      </h2>
      <p className="gg-body gg-body--sub" style={{ marginBottom: 36, maxWidth: 640 }}>
        A rough range in three picks. Yulia’s real valuation uses your actual tax returns, add-backs, and industry comps.
      </p>

      <div className="gg-demo-grid">
        {/* ── Inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DemoInput label="Annual revenue"       options={REVENUE_BANDS.map(b => b.label)}  activeIdx={revIdx}    onPick={setRevIdx} />
          <DemoInput label="Industry"             options={INDUSTRIES as unknown as string[]} activeIdx={industry ? INDUSTRIES.indexOf(industry as typeof INDUSTRIES[number]) : null} onPick={i => setIndustry(INDUSTRIES[i])} />
          <DemoInput label="EBITDA margin"        options={MARGIN_BANDS.map(m => m.label)}   activeIdx={marginIdx} onPick={setMarginIdx} />
        </div>

        {/* ── Output card — renders skeleton until all three inputs selected ── */}
        <div
          className="gg-card"
          style={{
            padding: 32,
            borderRadius: 22,
            background: result ? 'var(--gg-accent)' : 'var(--gg-bg-card)',
            color: result ? '#fff' : 'var(--gg-text-primary)',
            borderColor: result ? 'var(--gg-accent)' : 'var(--gg-border)',
            boxShadow: result
              ? 'inset 0 0.5px 0 rgba(255, 255, 255, 0.12), 0 8px 28px rgba(0, 0, 0, 0.14)'
              : undefined,
            transition: 'background 240ms var(--gg-ease-spring), color 240ms var(--gg-ease-spring)',
            minHeight: 320,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {!result ? (
            <>
              <div className="gg-label" style={{ marginBottom: 14, color: 'var(--gg-text-faint)' }}>Estimated range</div>
              <div style={{
                fontFamily: 'var(--gg-display)',
                fontWeight: 800,
                fontSize: 'clamp(36px, 4.5vw, 52px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                color: 'var(--gg-text-faint)',
                marginBottom: 18,
              }}>
                $— – $—
              </div>
              <p className="gg-body" style={{ fontSize: 14, color: 'var(--gg-text-muted)', marginTop: 'auto' }}>
                Pick revenue, industry, and margin to see a range.
              </p>
            </>
          ) : (
            <>
              <div className="gg-label" style={{ marginBottom: 14, color: 'rgba(255,255,255,0.55)' }}>Estimated enterprise value</div>
              <div style={{
                fontFamily: 'var(--gg-display)',
                fontWeight: 800,
                fontSize: 'clamp(36px, 4.5vw, 52px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                marginBottom: 14,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {fmtMoney(result.evLow)} – {fmtMoney(result.evHigh)}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                {fmtMoney(result.ebitda)} EBITDA × {result.multLow.toFixed(1)}–{result.multHigh.toFixed(1)}× industry multiple.
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>
                Industry-pattern estimate. Your real number depends on specific add-backs, concentration, owner dependency, and comp set.
              </p>
              <button
                type="button"
                onClick={handoff}
                style={{
                  marginTop: 'auto',
                  padding: '13px 20px',
                  border: 0,
                  borderRadius: 999,
                  background: '#fff',
                  color: 'var(--gg-text-primary)',
                  fontFamily: 'var(--gg-display)',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '-0.005em',
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  alignSelf: 'flex-start',
                  transition: 'transform var(--gg-t-feedback) var(--gg-ease-snap)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Continue this with Yulia
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function DemoInput({ label, options, activeIdx, onPick }: {
  label: string; options: string[]; activeIdx: number | null; onPick: (i: number) => void;
}) {
  return (
    <div>
      <div className="gg-input-label" style={{ marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            className={`gg-chip${i === activeIdx ? ' active' : ''}`}
            aria-pressed={i === activeIdx}
            onClick={() => onPick(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CHAT STARTER — each card sends a specific question to Yulia, not a
   navigation to a static journey page. Visitor enters the conversation
   with real context, which is the whole product.
   ══════════════════════════════════════════════════════════════════════ */

function ChatStarter({ label, prompt, teaser, onSend }: {
  label: string; prompt: string; teaser: string; journey: Journey;
  onSend: (text: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSend(prompt)}
      className="gg-card gg-card--clickable"
      style={{
        padding: 28,
        display: 'flex', flexDirection: 'column',
        borderRadius: 20,
        background: 'var(--gg-bg-card)',
        textAlign: 'left',
        fontFamily: 'var(--gg-body)',
        minHeight: 200,
      }}
    >
      <div style={{
        fontFamily: 'var(--gg-display)',
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--gg-text-faint)',
        marginBottom: 16,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--gg-display)',
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        color: 'var(--gg-text-primary)',
        marginBottom: 14,
      }}>
        {prompt.split('.')[0]}.
      </div>
      <p className="gg-body" style={{ fontSize: 13.5, lineHeight: 1.55, marginBottom: 20, color: 'var(--gg-text-secondary)' }}>
        {teaser}
      </p>
      <span style={{
        marginTop: 'auto',
        fontFamily: 'var(--gg-display)',
        fontWeight: 700,
        fontSize: 12.5,
        letterSpacing: '-0.005em',
        color: 'var(--gg-text-primary)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        Ask Yulia
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}
