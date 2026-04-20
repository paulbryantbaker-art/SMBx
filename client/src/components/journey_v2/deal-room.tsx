/**
 * Glass Grok v2 · public journey — shared "deal room" chrome.
 *
 * Every public page is a split-screen: Yulia chat rail on the left
 * narrates the scroll, a reactive workbench on the right shows the
 * artifact she's producing. Each page ends in a chat input. Visitor's
 * first action is to talk to Yulia — not to read a hero.
 *
 * The pattern is ported from the HTML prototypes in
 * ../new_journey/project/. Visual layer in deal-room.css is a verbatim
 * copy of the prototype CSS — React components consume those class
 * names directly, no re-architecture.
 */
import {
  type ReactNode,
  useEffect, useMemo, useRef, useState,
  type FormEvent,
} from 'react';
import './deal-room.css';

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export type DealStepMsg = { who: 'y' | 'me'; text: string };
export type DealStepScript = Record<number, DealStepMsg[]>;

export type DealTab =
  | 'home' | 'sell' | 'buy' | 'raise' | 'integrate'
  | 'how-it-works' | 'pricing' | 'enterprise';

export interface SectionNavItem { id: string; label: string }

/* ═══════════════════════════════════════════════════════════════════
   TOP BAR — sticky, 56px, backdrop-blur
   ═══════════════════════════════════════════════════════════════════ */

const TOP_LINKS: { id: DealTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'sell', label: 'Sell' },
  { id: 'buy', label: 'Buy' },
  { id: 'raise', label: 'Raise' },
  { id: 'integrate', label: 'Integrate' },
  { id: 'how-it-works', label: 'How' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'enterprise', label: 'Enterprise' },
];

function DrTop({ active, onNavigate, onSignIn, onStartFree }: {
  active: DealTab;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
  onStartFree: () => void;
}) {
  return (
    <div className="dr-top">
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <a
          href="#"
          className="dr-top__logo"
          onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          smbx.ai
        </a>
        <nav className="dr-top__nav">
          {TOP_LINKS.map(l => (
            <a
              key={l.id}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate(l.id); }}
              className={active === l.id ? 'active' : ''}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="dr-top__cta">
        <button type="button" className="dr-top__signin" onClick={onSignIn}>
          Sign in
        </button>
        <button type="button" className="dr-top__btn" onClick={onStartFree}>
          Start free →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION NAV — sticky pill under top bar
   ═══════════════════════════════════════════════════════════════════ */

function DrNav({ items, activeId, onJump }: {
  items: readonly SectionNavItem[];
  activeId: string | null;
  onJump: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <nav className="dr-nav" aria-label="Section nav">
      {items.map(it => (
        <button
          key={it.id}
          type="button"
          data-jump={it.id}
          className={activeId === it.id ? 'active' : ''}
          onClick={() => onJump(it.id)}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   YULIA RAIL — sticky chat rail on the left
   Self-contained: renders message history, typing indicator, input,
   quick-reply chips. useStepScript (below) drives what gets appended.
   ═══════════════════════════════════════════════════════════════════ */

export interface YuliaRailProps {
  /** Display name — defaults to "Yulia". */
  name?: string;
  /** Status line under the name, e.g. "Working on Acme HVAC". */
  status: string;
  /** Scripted messages to play as steps enter the viewport. */
  script: DealStepScript;
  /** Generic reply when the visitor sends text the script doesn't cover. */
  reply?: string;
  /** Opening Yulia message shown immediately. */
  opening?: string;
  /** Placeholder in the chat input. */
  placeholder?: string;
  /** Quick-reply chip prompts. */
  chips?: readonly string[];
  /** Visitor sent something real — escape the demo, go to chat view. */
  onSend?: (text: string) => void;
  /** IntersectionObserver target selector. Defaults to `.dr-step[data-step]`. */
  stepsSelector?: string;
  /** Live demo badge. */
  liveLabel?: string;
}

interface RailMessage {
  id: number;
  who: 'y' | 'me';
  text: string;
  animate: boolean;
}

function Typing() {
  return (
    <div className="dr-typing"><span /><span /><span /></div>
  );
}

export function YuliaRail(props: YuliaRailProps) {
  const {
    name = 'Yulia',
    status,
    script,
    reply = 'Drop your <strong>industry</strong>, <strong>revenue</strong>, and <strong>EBITDA</strong> and I\u2019ll return a preliminary range in about 20 minutes.',
    opening = 'Hi \u2014 I\u2019m <strong>Yulia</strong>. Scroll to follow along.',
    placeholder = 'Ask Yulia anything\u2026',
    chips = [],
    onSend,
    liveLabel = 'LIVE DEMO',
  } = props;

  const [messages, setMessages] = useState<RailMessage[]>([
    { id: 0, who: 'y', text: opening, animate: false },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(1);
  const playedRef = useRef<Set<number>>(new Set());
  const timersRef = useRef<number[]>([]);

  const nextId = () => idRef.current++;
  const appendMsg = (who: 'y' | 'me', text: string, animate = true) => {
    setMessages(prev => [...prev, { id: nextId(), who, text, animate }]);
  };

  /* Smooth-scroll to bottom whenever messages or typing state changes. */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  /* Step-observer — plays SCRIPT[N] when step N enters viewport. */
  useEffect(() => {
    const steps = document.querySelectorAll<HTMLElement>('.dr-step[data-step]');
    if (steps.length === 0) return;

    const play = (n: number) => {
      if (playedRef.current.has(n)) return;
      playedRef.current.add(n);
      /* Flash the bench in the corresponding step. */
      const bench = document.querySelector<HTMLElement>(`[data-step="${n}"] .dr-bench`);
      if (bench) {
        bench.classList.remove('flash');
        void bench.offsetWidth;
        bench.classList.add('flash');
      }
      const msgs = script[n] || [];
      let t = 280;
      msgs.forEach((m, i) => {
        const delay = t;
        const id = window.setTimeout(() => {
          if (m.who === 'y' && i > 0) {
            setIsTyping(true);
            const id2 = window.setTimeout(() => {
              setIsTyping(false);
              appendMsg(m.who, m.text);
            }, 500);
            timersRef.current.push(id2);
          } else {
            appendMsg(m.who, m.text);
          }
        }, delay);
        timersRef.current.push(id);
        t += 800 + m.text.length * 2.6;
      });
    };

    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length === 0) return;
      const top = visible[0].target as HTMLElement;
      const n = parseInt(top.dataset.step ?? '', 10);
      if (!Number.isNaN(n)) play(n);
    }, { rootMargin: '-18% 0px -55% 0px', threshold: 0 });

    steps.forEach(s => obs.observe(s));
    return () => {
      obs.disconnect();
      timersRef.current.forEach(id => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [script]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    handlePrompt(msg);
  };

  const handlePrompt = (text: string) => {
    if (!text.trim()) return;
    appendMsg('me', text);
    setIsTyping(true);
    const id = window.setTimeout(() => {
      setIsTyping(false);
      appendMsg('y', reply);
      /* Escalate to real chat if caller wants it. */
      onSend?.(text);
    }, 900);
    timersRef.current.push(id);
  };

  const avatarLetter = name.trim().charAt(0).toUpperCase() || 'Y';

  return (
    <aside className="dr-rail">
      <div className="dr-rail__head">
        <div className="dr-rail__avatar">{avatarLetter}</div>
        <div className="dr-rail__who">
          <span className="dr-rail__name">{name}</span>
          <span className="dr-rail__status">{status}</span>
        </div>
        <span className="dr-rail__live">{liveLabel}</span>
      </div>

      <div className="dr-rail__scroll" id="chat" ref={scrollRef}>
        {messages.map(m => (
          <div
            key={m.id}
            className={`dr-msg dr-msg--${m.who}`}
            style={m.animate ? undefined : { animation: 'none' }}
          >
            <div className="dr-msg__meta">{m.who === 'y' ? 'YULIA' : 'YOU'}</div>
            <div
              className="dr-msg__bubble"
              dangerouslySetInnerHTML={{ __html: m.text }}
            />
          </div>
        ))}
        {isTyping && <Typing />}
      </div>

      <div className="dr-rail__input">
        <form className="dr-rail__chat" onSubmit={handleSubmit} id="chatForm">
          <input
            id="chatInput"
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="dr-rail__send" type="submit" aria-label="Send">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </button>
        </form>
        {chips.length > 0 && (
          <div className="dr-rail__chips">
            {chips.map(c => (
              <button
                key={c}
                type="button"
                data-prompt={c}
                onClick={() => handlePrompt(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DEAL STEP — section wrapper for one `.dr-step[data-step=N]`
   ═══════════════════════════════════════════════════════════════════ */

export interface DealStepProps {
  n: number;
  id: string;
  idx: string;     /* Mono eyebrow — "Step 01 · What you have" */
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  /**
   * Typography + layout scale.
   *  - `hero` (default on n=1): clamp(56px, 9vw, 128px) — marquee
   *  - `major`: clamp(48px, 6vw, 96px) — primary section
   *  - `section` (default): clamp(40px, 5vw, 72px) — standard section
   *  - `minor`: clamp(32px, 3.6vw, 48px) — small/aside section
   */
  scale?: 'hero' | 'major' | 'section' | 'minor';
  /**
   * Composition variant.
   *  - `full` (default): content fills column
   *  - `narrow`: editorial column, 560px max — for prose-heavy sections
   *  - `rail-right`: body on left, narrow callout on right
   */
  layout?: 'full' | 'narrow' | 'rail-right';
  /** Optional right-side callout used with `layout='rail-right'`. */
  callout?: ReactNode;
}

export function DealStep({
  n, id, idx, title, lede, children,
  scale, layout = 'full', callout,
}: DealStepProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Single scale vocabulary. CSS handles the type size from the
     data-scale attribute — no inline sizing. */
  const effectiveScale = scale ?? (n === 1 ? 'hero' : 'section');

  /* Title max-width keeps big headlines from running edge to edge. */
  const titleMax: React.CSSProperties =
    effectiveScale === 'hero'  ? { maxWidth: '11ch' } :
    effectiveScale === 'major' ? { maxWidth: '16ch' } :
    layout === 'narrow'        ? { maxWidth: '24ch' } :
                                 { maxWidth: '22ch' };

  const ledeWrap: React.CSSProperties = layout === 'narrow' ? { maxWidth: '48ch' } : {};

  return (
    <section
      ref={ref}
      className="dr-step"
      id={id}
      data-step={n}
      data-scale={effectiveScale}
      data-layout={layout}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {layout === 'rail-right' && callout ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)', gap: 'var(--dr-s-6)' }}>
          <div>
            <div className="dr-step__head">
              <span className="dr-step__idx">{idx}</span>
            </div>
            <h1 className="dr-step__title" style={titleMax}>{title}</h1>
            {lede && <p className="dr-step__lede" style={ledeWrap}>{lede}</p>}
            {children}
          </div>
          <aside style={{
            paddingLeft: 'var(--dr-s-4)',
            borderLeft: '2px solid rgba(212,74,120,0.45)',
          }}>{callout}</aside>
        </div>
      ) : (
        <>
          <div className="dr-step__head">
            <span className="dr-step__idx">{idx}</span>
          </div>
          <h1 className="dr-step__title" style={titleMax}>{title}</h1>
          {lede && <p className="dr-step__lede" style={ledeWrap}>{lede}</p>}
          {children}
        </>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PULL QUOTE — single-sentence thesis statement between dense sections.
   Light-weight Sora, italic, large. Huge vertical margins. Max 14 words
   as a rule — if it takes more, it's not a pull-quote, it's prose.
   ═══════════════════════════════════════════════════════════════════ */

export interface PullQuoteProps {
  children: ReactNode;
  attribution?: ReactNode;
  align?: 'left' | 'center';
}

export function PullQuote({ children, attribution, align = 'left' }: PullQuoteProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <aside
      ref={ref}
      className="dr-pull"
      data-align={align}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 620ms cubic-bezier(0.22, 1, 0.36, 1), transform 620ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <blockquote className="dr-pull__q">{children}</blockquote>
      {attribution && <div className="dr-pull__attrib">— {attribution}</div>}
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STAT BREAKER — full-bleed dark release valve between dense sections.
   ONE massive number. Tiny label. Nothing else. Ever.
   ═══════════════════════════════════════════════════════════════════ */

export interface StatBreakerProps {
  /** The one number that matters. Keep it ≤ 8 chars. */
  value: string;
  label: string;
  /** Optional tiny source line ("HBR, 2024"). */
  source?: string;
  /** Optional second stat to the right — sparingly. */
  secondary?: { value: string; label: string };
}

export function StatBreaker({ value, label, source, secondary }: StatBreakerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="dr-stat"
      data-has-secondary={secondary ? 'true' : 'false'}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 640ms cubic-bezier(0.22, 1, 0.36, 1), transform 640ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="dr-stat__primary">
        <div className="dr-stat__value">{value}</div>
        <div className="dr-stat__label">{label}</div>
        {source && <div className="dr-stat__source">{source}</div>}
      </div>
      {secondary && (
        <div className="dr-stat__secondary">
          <div className="dr-stat__value dr-stat__value--sm">{secondary.value}</div>
          <div className="dr-stat__label">{secondary.label}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DEAL BENCH — the workbench card
   ═══════════════════════════════════════════════════════════════════ */

export interface DealBenchProps {
  title: string;
  meta?: ReactNode;         /* e.g. "6 MIN AGO" or <>YULIA · LIVE</> */
  metaLive?: boolean;       /* show the pulsing green dot */
  bodyStyle?: React.CSSProperties;
  children: ReactNode;
}

export function DealBench({ title, meta, metaLive, bodyStyle, children }: DealBenchProps) {
  return (
    <div className="dr-bench">
      <div className="dr-bench__head">
        <div className="dr-bench__title">{title}</div>
        {meta !== undefined && (
          <div className="dr-bench__meta">
            {metaLive && <span className="dr-bench__dot" />}
            {meta}
          </div>
        )}
      </div>
      <div className="dr-bench__body" style={bodyStyle}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED ATOMS
   ═══════════════════════════════════════════════════════════════════ */

export function Row({ title, sub, amt, highlight }: {
  title: ReactNode; sub?: ReactNode; amt: ReactNode; highlight?: boolean;
}) {
  return (
    <div
      className="row"
      style={highlight ? {
        background: '#F5F5F7',
        margin: '0 -22px -22px',
        padding: '16px 22px',
        borderTop: '0.5px solid rgba(0,0,0,0.08)',
      } : undefined}
    >
      <div>
        <div className="row__title">{title}</div>
        {sub && <div className="row__sub">{sub}</div>}
      </div>
      <div className="row__amt" style={highlight ? { fontSize: 22 } : undefined}>{amt}</div>
    </div>
  );
}

export function Pill({ tone = 'ok', children }: { tone?: 'ok' | 'warn' | 'flag'; children: ReactNode }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

/* Score donut — used on Sell readiness + Buy Rundown */
export function ScoreDonut({ score, max = 100, size = 180 }: { score: number; max?: number; size?: number }) {
  const circumference = 2 * Math.PI * 90;
  const pctFilled = Math.max(0, Math.min(1, score / max));
  const dashOffset = circumference * (1 - pctFilled);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r="90" fill="none" stroke="#F0F0F2" strokeWidth="16" />
        <circle
          cx="100" cy="100" r="90"
          fill="none" stroke="#0A0A0B" strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.19,1,0.22,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 54, letterSpacing: '-0.035em' }}>
          {score}<span style={{ fontSize: 18, color: '#9A9A9F' }}>/{max}</span>
        </div>
      </div>
    </div>
  );
}

/* Six-dimension score list — used with ScoreDonut */
export type Dim = { label: string; value: number; tone: 'green' | 'amber' | 'red' };
const DIM_TONE: Record<Dim['tone'], string> = {
  green: '#22A755',
  amber: '#E8A033',
  red:   '#D4533A',
};
export function DimList({ dims }: { dims: readonly Dim[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {dims.map(d => (
        <div key={d.label} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: DIM_TONE[d.tone] }} />
          <span style={{ flex: 1, color: '#3A3A3E', fontWeight: 500 }}>{d.label}</span>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{d.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BOTTOM CLOSE — black block, chat input, lands the visitor in a
   real Yulia conversation.
   ═══════════════════════════════════════════════════════════════════ */

export interface DealBottomProps {
  heading: string;
  sub?: string;
  placeholder: string;
  onSend: (text: string) => void;
}

export function DealBottom({ heading, sub, placeholder, onSend }: DealBottomProps) {
  const [input, setInput] = useState('');
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    onSend(msg);
  };
  return (
    <section className="dr-step" id="close" data-step={-1}>
      <div className="dr-bottom">
        <h2>{heading}</h2>
        {sub && <p>{sub}</p>}
        <form className="dr-bottom__chat" onSubmit={handleSubmit} id="chatFormBottom">
          <input
            id="chatInputBottom"
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="dr-bottom__send" type="submit" aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DEAL ROOM PAGE — top-level layout wrapper.
   Every public page wraps its stage content in this.
   ═══════════════════════════════════════════════════════════════════ */

export interface DealRoomPageProps {
  active: DealTab;
  /** Section-nav pill buttons (empty array → hide the pill). */
  sectionNav?: readonly SectionNavItem[];
  /** Everything that renders inside the right-side stage. */
  children: ReactNode;
  /** Yulia rail props. */
  rail: YuliaRailProps;
  /** Called when a top-nav link is clicked. */
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
  onStartFree: () => void;
}

export function DealRoomPage({
  active, children, rail, onNavigate, onSignIn, onStartFree,
  /* sectionNav still accepted on the API so page callers don't break —
     we just don't render it anymore. Dropped per Paul: "on desktop
     there are too many menu bars in journey." Step idx badges + the
     scripted rail cover wayfinding. */
  sectionNav: _sectionNav = [],
}: DealRoomPageProps & { sectionNav?: DealRoomPageProps['sectionNav'] }) {
  void _sectionNav;

  /* Stable rail — we don't want it re-mounting when children change.
     Memoize on rail props deeply enough that steps/chips changes don't
     trigger re-render of the script observer. */
  const railEl = useMemo(
    () => <YuliaRail {...rail} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rail.name, rail.status, rail.opening, rail.reply, rail.placeholder, rail.liveLabel,
     rail.script, rail.chips, rail.onSend],
  );

  return (
    <div className="dr-page">
      <DrTop
        active={active}
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onStartFree={onStartFree}
      />
      {/* DrNav section-nav pill dropped on desktop per Paul 2026-04-20:
          "on desktop there are too many menu bars in journey." Each
          dr-step has its own ".dr-step__idx" badge (e.g. "Step 01 · What
          you have") for in-scroll wayfinding — the pill was redundant.
          activeSection + jumpTo are unused now but preserved in state
          for the scroll-spy observer below, which still tracks the top
          step in case we ever need to expose it to the rail or top bar. */}
      <div className="dr-main">
        {railEl}
        <main className="dr-stage">{children}</main>
      </div>
    </div>
  );
}
