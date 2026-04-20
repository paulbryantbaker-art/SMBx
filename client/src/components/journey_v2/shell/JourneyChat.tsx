/**
 * JourneyChat — scripted Yulia chat well on public journey pages.
 *
 * Same visual + class names as V4Chat (`.v4-chat`, `.v4-chat__scroll`,
 * `.v4-chat__grip`, `.v4-comp`) so the morph from `/sell` → `/chat` is
 * just content swapping, not layout change.
 *
 * The scripted content is driven by an IntersectionObserver that
 * watches `.dr-step[data-step]` sections in the canvas — same pattern
 * as the old DealRoomPage's YuliaRail. When step N enters the viewport,
 * we type Yulia messages from `script[N]` into the chat. Plus: opening
 * message on mount, generic reply when the visitor hits Enter.
 */
import {
  useEffect, useRef, useState, type FormEvent,
} from 'react';
import type { DealStepMsg, DealStepScript } from '../deal-room';

export interface JourneyChatProps {
  /** Thread header title (top of the chat well). */
  title?: string;
  /** Status line next to the title — "Working on Acme HVAC", etc. */
  status?: string;
  /** Opening Yulia message rendered immediately. */
  opening: string;
  /** Generic reply when the visitor sends text the script doesn't cover. */
  reply: string;
  /** Per-step scripted messages played when the matching dr-step enters viewport. */
  script: DealStepScript;
  /** Quick-reply chips shown under the composer. */
  chips?: readonly string[];
  /** Placeholder in the composer input. */
  placeholder?: string;
  /** Visitor sent something real — escape the demo, go to real chat. */
  onSend?: (text: string) => void;
  /** Resizable width. */
  width: number;
  onWidthChange: (w: number) => void;
}

interface ChatMsg {
  id: number;
  who: 'y' | 'me';
  text: string;
  animate: boolean;
}

function Typing() {
  /* Matches .v4-chat__typing in shell.css — 3 bouncing dots. */
  return (
    <div className="v4-chat__typing">
      <span /><span /><span />
    </div>
  );
}

function Msg({ who, text }: { who: 'y' | 'me'; text: string }) {
  return (
    <div className={`v4-msg v4-msg--${who}`}>
      {who === 'y' && <div className="v4-msg__av">Y</div>}
      <div className="v4-msg__body">
        <div
          className="v4-msg__bubble"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </div>
  );
}

export default function JourneyChat({
  title = 'Yulia',
  status,
  opening,
  reply,
  script,
  chips = [],
  placeholder = 'Ask Yulia anything\u2026',
  onSend,
  width, onWidthChange,
}: JourneyChatProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 0, who: 'y', text: opening, animate: false },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(1);
  const playedRef = useRef<Set<number>>(new Set());
  const timersRef = useRef<number[]>([]);
  const appendMsg = (who: 'y' | 'me', text: string, animate = true) => {
    setMessages((prev) => [...prev, { id: idRef.current++, who, text, animate }]);
  };

  /* Smooth-scroll to bottom on new content. */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  /* IntersectionObserver on .dr-step[data-step] — plays script[N] when
     step N becomes the topmost visible step. Identical behavior to the
     old YuliaRail observer. */
  useEffect(() => {
    const steps = document.querySelectorAll<HTMLElement>('.dr-step[data-step]');
    if (steps.length === 0) return;

    const play = (n: number) => {
      if (playedRef.current.has(n)) return;
      playedRef.current.add(n);
      const bench = document.querySelector<HTMLElement>(`[data-step="${n}"] .dr-bench`);
      if (bench) {
        bench.classList.remove('flash');
        void bench.offsetWidth;
        bench.classList.add('flash');
      }
      const msgs: DealStepMsg[] = script[n] || [];
      let t = 280;
      msgs.forEach((m, i) => {
        const id = window.setTimeout(() => {
          if (m.who === 'y' && i > 0) {
            setTyping(true);
            const id2 = window.setTimeout(() => {
              setTyping(false);
              appendMsg(m.who, m.text);
            }, 500);
            timersRef.current.push(id2);
          } else {
            appendMsg(m.who, m.text);
          }
        }, t);
        timersRef.current.push(id);
        t += 800 + m.text.length * 2.6;
      });
    };

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const top = visible[0].target as HTMLElement;
        const n = parseInt(top.dataset.step ?? '', 10);
        if (!Number.isNaN(n)) play(n);
      },
      { rootMargin: '-18% 0px -55% 0px', threshold: 0 },
    );
    steps.forEach((s) => obs.observe(s));
    return () => {
      obs.disconnect();
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [script]);

  const handlePrompt = (text: string) => {
    if (!text.trim()) return;
    appendMsg('me', text);
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      appendMsg('y', reply);
      onSend?.(text);
    }, 900);
    timersRef.current.push(id);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    handlePrompt(msg);
  };

  /* Drag-to-resize grip (mirrors V4Chat exactly). */
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const next = Math.max(300, Math.min(620, e.clientX - 84));
      onWidthChange(next);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, onWidthChange]);

  const styleVars: React.CSSProperties = { ['--v4-chat-w' as string]: width + 'px' };

  return (
    <section className="v4-chat" style={styleVars}>
      {/* Thread header — mirrors V4Chat's head (minus portfolio switcher
          which is a logged-in concept). */}
      <div className="v4-chat__head">
        <div className="v4-chat__head-t">{title}{status && <span style={{ color: 'var(--v4-mute)', fontWeight: 500, marginLeft: 8 }}>· {status}</span>}</div>
      </div>

      {/* Scrolling message list */}
      <div className="v4-chat__scroll" ref={scrollRef}>
        {messages.map((m) => (
          <Msg key={m.id} who={m.who} text={m.text} />
        ))}
        {typing && <Typing />}
        {chips.length > 0 && messages.length <= 1 && (
          <div className="v4-chat__chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 18px 0' }}>
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handlePrompt(c)}
                style={{
                  padding: '6px 11px',
                  borderRadius: 999,
                  border: '0.5px solid var(--v4-card-line)',
                  background: 'var(--v4-card)',
                  color: 'var(--v4-ink-2)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer — simple pill matching V4Composer shape. */}
      <div className="v4-comp">
        <form className="v4-comp__wrap" onSubmit={handleSubmit}>
          <div className="v4-comp__pill">
            <input
              type="text"
              className="v4-comp__ta"
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
            />
            <button
              type="submit"
              className={`v4-comp__send${input.trim() ? '' : ' v4-comp__send--idle'}`}
              disabled={!input.trim()}
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Resize grip */}
      <div
        className={`v4-chat__grip${dragging ? ' v4-chat__grip--dragging' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
      />
    </section>
  );
}
