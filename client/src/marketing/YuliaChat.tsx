import { useEffect, useRef, useState } from 'react';
import { enterApp, YULIA_OPEN_EVENT, type YuliaOpenDetail } from './useEnterApp';
import { YuliaGlyph } from './MarketingChrome';
import { useMarketingChat } from './useMarketingChat';

const ROTATING_PLACEHOLDERS = [
  "Value a business I'm considering buying…",
  'Build a working capital peg for a deal…',
  'Draft a CIM for a company I’m selling…',
  'Model an SBA-financed acquisition…',
  'Explain how a §1060 allocation works…',
];

const STARTER_PROMPTS = [
  'Value a business I’m considering buying',
  'Build a working capital peg',
  'Draft a CIM for a sale process',
  'Explain a methodology concept (no data needed)',
];

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The hero chat-input launcher. Submitting opens the Yulia bubble and carries
 * the message into it (enterApp dispatches YULIA_OPEN_EVENT with the message).
 */
export function YuliaLauncher() {
  const [value, setValue] = useState('');
  const [phIdx, setPhIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % ROTATING_PLACEHOLDERS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    enterApp(v);
    setValue('');
  };

  return (
    <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className="launcher">
        <span className="yulia-glyph"><YuliaGlyph /></span>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder={ROTATING_PLACEHOLDERS[phIdx]}
          autoComplete="off"
          aria-label="Ask Yulia"
        />
        <button className="send" onClick={submit} aria-label="Ask Yulia"><SendIcon /></button>
      </div>
      <p className="launcher-note">Yulia works from your real numbers — a tax return, a few figures, or a name.</p>
    </div>
  );
}

/** The floating chat (FAB) present on every marketing page. */
export function YuliaFab() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const { messages, streamingText, sending, gate, remaining, error, send } = useMarketingChat();

  // Keep the latest `send` reachable from the (stable) open-event listener.
  const sendRef = useRef(send);
  useEffect(() => { sendRef.current = send; }, [send]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Auto-scroll to the newest message as the conversation grows / streams.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamingText, gate, open]);

  // Any "Ask Yulia" CTA across the marketing site opens this bubble; a typed
  // message (from the hero launcher) is auto-sent.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const detail = (e as CustomEvent<YuliaOpenDetail>).detail;
      if (detail?.message) sendRef.current(detail.message);
    };
    window.addEventListener(YULIA_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(YULIA_OPEN_EVENT, onOpen);
  }, []);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    send(v);
    setValue('');
  };

  const hasConversation = messages.length > 0 || !!streamingText || sending;
  const showRemainingHint = remaining !== null && remaining <= 5 && !gate;

  return (
    <>
      <button className="mkt-fab" aria-label="Talk to Yulia" onClick={() => setOpen(o => !o)}>
        <YuliaGlyph size={24} />
        <span className="bdot" />
      </button>

      <div className={`mkt-chatwin${open ? ' open' : ''}`} role="dialog" aria-label="Talk to Yulia">
        <div className="mkt-chatwin-hd">
          <span className="av"><YuliaGlyph size={16} /></span>
          <div>
            <div className="nm">Yulia</div>
            <div className="st"><span className="vdot" />deal intelligence · online</div>
          </div>
          <button className="cx" aria-label="Close" onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="mkt-chatwin-body" ref={bodyRef}>
          {!hasConversation && !gate && (
            <>
              <p className="mkt-chatwin-intro">
                Hi — I'm Yulia. I work on deal analysis, valuation, working capital,
                structuring, and post-close. Tell me what you're working on, or pick one:
              </p>
              <div className="mkt-chip-row">
                {STARTER_PROMPTS.map(p => (
                  <button key={p} className="mkt-chip" onClick={() => send(p)}>{p}</button>
                ))}
              </div>
            </>
          )}

          {messages.map(m => (
            <div key={m.id} className={`mkt-msg ${m.role === 'user' ? 'user' : 'bot'}`}>{m.content}</div>
          ))}

          {streamingText && (
            <div className="mkt-msg bot">{streamingText}<span className="mkt-caret" /></div>
          )}
          {sending && !streamingText && (
            <div className="mkt-msg bot mkt-thinking"><span /><span /><span /></div>
          )}

          {error && !gate && <p className="mkt-chat-err">{error}</p>}

          {showRemainingHint && (
            <p className="mkt-remaining">{remaining} preview {remaining === 1 ? 'message' : 'messages'} left</p>
          )}

          {gate && (
            <div className="mkt-signup">
              <p>
                {gate === 'limit'
                  ? "That's the end of the preview. Create a free account to keep going — this whole conversation comes with you."
                  : "You've used your previews on this device. Create a free account for unlimited chat with Yulia."}
              </p>
              <button className="mkt-signup-btn" onClick={() => window.location.assign('/signup')}>
                Create your free account
              </button>
              <button className="mkt-signup-alt" onClick={() => window.location.assign('/login')}>
                Already have an account? Sign in
              </button>
            </div>
          )}
        </div>

        <div className="mkt-chatwin-foot">
          <div className="launcher">
            <span className="yulia-glyph"><YuliaGlyph /></span>
            <input
              ref={inputRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              placeholder={gate ? 'Sign up to keep chatting…' : 'Ask Yulia…'}
              autoComplete="off"
              aria-label="Ask Yulia"
              disabled={!!gate}
            />
            <button className="send" onClick={submit} aria-label="Send" disabled={!!gate || sending}><SendIcon /></button>
          </div>
          {hasConversation && !gate && (
            <div className="mkt-foot-auth">
              <button onClick={() => window.location.assign('/signup')}>Sign up to save this chat</button>
              <span>·</span>
              <button onClick={() => window.location.assign('/login')}>Sign in</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
