/**
 * V4Chat — chat well (flat on backdrop, draggable width).
 *
 * Mirrors `claude_design/app/project/v4-chat.jsx`:
 *   V4PortfolioSwitch  — workspace picker (top)
 *   V4ChatHead         — thread header (non-empty state)
 *   V4ChatEmpty        — hero + 4 starter prompts
 *   V4Msg              — single message bubble w/ optional progress + artifacts
 *   V4Typing           — 3-dot indicator
 *   V4Composer         — attachment list + pill textarea + plus-menu + send
 *   V4Chat             — composes all of the above + resize grip
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PORTFOLIOS, type Portfolio } from '../data';
import type { ChatMessage } from '../session';

/* ═══════════════════════════════════════════════════════════════════
   Portfolio switcher
   ═══════════════════════════════════════════════════════════════════ */

function V4PortfolioSwitch({ portfolio, onChange }: { portfolio: Portfolio; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="v4-psw" ref={ref}>
      <button type="button" className="v4-psw__btn" onClick={() => setOpen((o) => !o)}>
        <div className="v4-psw__logo">{portfolio.name.charAt(0).toUpperCase()}</div>
        <div className="v4-psw__body">
          <div className="v4-psw__n">{portfolio.name}</div>
          <div className="v4-psw__k">{portfolio.kicker}</div>
        </div>
        <svg className="v4-psw__caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="v4-psw__pop">
          <div className="v4-psw__pop-h">WORKSPACES</div>
          {PORTFOLIOS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={'v4-psw__pop-row' + (p.id === portfolio.id ? ' active' : '')}
              onClick={() => {
                onChange(p.id);
                setOpen(false);
              }}
            >
              <div className="v4-psw__pop-logo">{p.name.charAt(0)}</div>
              <div className="v4-psw__pop-body">
                <div className="v4-psw__pop-n">{p.name}</div>
                <div className="v4-psw__pop-k">
                  {p.kicker} · {p.dealIds.length} DEALS
                </div>
              </div>
            </button>
          ))}
          <div className="v4-psw__pop-sep" />
          <button type="button" className="v4-psw__pop-row">
            <div className="v4-psw__pop-logo v4-psw__pop-logo--new">+</div>
            <div className="v4-psw__pop-body">
              <div className="v4-psw__pop-n">New workspace</div>
              <div className="v4-psw__pop-k">FUND · ADVISOR · PERSONAL</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Message
   ═══════════════════════════════════════════════════════════════════ */

interface ArtifactSpec {
  label: string;
  sub?: string;
  icon?: string;
  _spec?: unknown;
}

function V4Msg({
  who,
  text,
  progress,
  artifacts,
  onOpenArtifact,
}: {
  who: 'y' | 'me';
  text: string;
  progress?: string[];
  artifacts?: ArtifactSpec[];
  onOpenArtifact?: (a: ArtifactSpec) => void;
}) {
  return (
    <div className={`v4-msg v4-msg--${who}`}>
      <div className="v4-msg__meta">
        <span className="v4-msg__av">{who === 'y' ? 'Y' : 'P'}</span>
        {who === 'y' ? 'Yulia' : 'You'}
      </div>
      <div className="v4-msg__bubble" dangerouslySetInnerHTML={{ __html: text }} />
      {progress && (
        <div className="v4-msg__progress">
          {progress.map((p, i) => (
            <div key={i} className="v4-msg__progress-row v4-msg__progress-row--running">
              <span className="v4-msg__progress-dot" />
              {p}
            </div>
          ))}
        </div>
      )}
      {artifacts && artifacts.length > 0 && (
        <div className="v4-msg__artifacts">
          {artifacts.map((a, i) => (
            <button key={i} type="button" className="v4-msg__artifact" onClick={() => onOpenArtifact?.(a)}>
              <div className="v4-msg__artifact-ico">{a.icon || '◆'}</div>
              <div className="v4-msg__artifact-body">
                <div className="v4-msg__artifact-t">{a.label}</div>
                <div className="v4-msg__artifact-s">{a.sub}</div>
              </div>
              <svg className="v4-msg__artifact-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function V4Typing() {
  return (
    <div className="v4-typing">
      <span className="v4-typing__dot" />
      <span className="v4-typing__dot" />
      <span className="v4-typing__dot" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Empty state
   ═══════════════════════════════════════════════════════════════════ */

function V4ChatEmpty({ portfolio, onStarter }: { portfolio: Portfolio; onStarter: (prompt: string) => void }) {
  const starters = [
    { t: 'Walk me through Atlas Air',           p: 'Walk me through Atlas Air' },
    { t: 'Score a target against our thesis',   p: 'Run a Rundown on Atlas Air' },
    { t: 'Compare the top three',               p: 'Compare Atlas, Summit and Benchmark' },
    { t: 'What needs my attention today?',      p: 'What needs my attention today?' },
  ];
  return (
    <div className="v4-chat__empty">
      <div>
        <div className="v4-chat__empty-t">Good morning, Paul.</div>
        <div className="v4-chat__empty-s">
          Working in <strong>{portfolio.name}</strong>. I've got {portfolio.dealIds.length} deals in play. Tell me where to start — or pick one below.
        </div>
      </div>
      <div className="v4-chat__empty-starters">
        {starters.map((s, i) => (
          <button key={i} type="button" className="v4-chat__empty-row" onClick={() => onStarter(s.p)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            {s.t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Composer
   ═══════════════════════════════════════════════════════════════════ */

interface ComposerFile {
  name: string;
  size: number;
  kind: string;
}

function V4Composer({ onSend, placeholder }: { onSend: (text: string, files: ComposerFile[]) => void; placeholder?: string }) {
  const [val, setVal] = useState('');
  const [files, setFiles] = useState<ComposerFile[]>([]);
  const [plusOpen, setPlusOpen] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 180) + 'px';
  }, [val]);

  useEffect(() => {
    if (!plusOpen) return;
    const h = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) setPlusOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [plusOpen]);

  const send = () => {
    if (val.trim() || files.length) {
      onSend(val.trim(), files);
      setVal('');
      setFiles([]);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    setFiles((f) => [
      ...f,
      ...list.map((x) => ({
        name: x.name,
        size: x.size,
        kind: (x.type.split('/')[0] || x.name.split('.').pop() || 'file').toLowerCase(),
      })),
    ]);
    e.target.value = '';
  };

  const fileKindIcon = (k: string): ReactNode => {
    if (k === 'image') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>;
    if (k === 'audio') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
    if (k === 'video') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>;
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>;
  };
  const fmtSize = (b: number) => (b < 1024 ? b + 'B' : b < 1048576 ? Math.round(b / 1024) + 'K' : (b / 1048576).toFixed(1) + 'M');

  const slashOptions = [
    { id: 'rundown', t: 'Run a Rundown',    s: 'Structured brief on any deal' },
    { id: 'dcf',     t: 'Build a DCF',      s: 'Live-linked valuation model'  },
    { id: 'compare', t: 'Compare deals',    s: 'Side-by-side scorecard'       },
    { id: 'loi',     t: 'Draft an LOI',     s: 'Term-sheet with placeholders' },
    { id: 'search',  t: 'Search portfolio', s: 'Across all deals and docs'    },
  ];

  return (
    <div className="v4-comp">
      <input ref={fileRef} type="file" multiple onChange={onPick} style={{ display: 'none' }} />
      {files.length > 0 && (
        <div className="v4-comp__files">
          {files.map((f, i) => (
            <div key={i} className="v4-comp__file">
              <div className="v4-comp__file-ico">{fileKindIcon(f.kind)}</div>
              <div className="v4-comp__file-body">
                <div className="v4-comp__file-n">{f.name}</div>
                <div className="v4-comp__file-s">{fmtSize(f.size)} · {f.kind}</div>
              </div>
              <button type="button" className="v4-comp__file-x" onClick={() => setFiles((ff) => ff.filter((_, j) => j !== i))}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="v4-comp__box">
        <div className="v4-comp__pill">
          <div ref={plusRef} className="v4-comp__plus-wrap">
            <button
              type="button"
              className={'v4-comp__attach' + (plusOpen ? ' v4-comp__attach--open' : '')}
              onClick={() => setPlusOpen((o) => !o)}
              title="Attach · commands"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            </button>
            {plusOpen && (
              <div className="v4-comp__plus-pop">
                <button
                  type="button"
                  className="v4-comp__plus-row"
                  onClick={() => {
                    fileRef.current?.click();
                    setPlusOpen(false);
                  }}
                >
                  <span className="v4-comp__plus-ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                  </span>
                  <span className="v4-comp__plus-t">Attach file</span>
                  <span className="v4-comp__plus-kbd">⌘U</span>
                </button>
                <button
                  type="button"
                  className="v4-comp__plus-row"
                  onClick={() => {
                    setVal((v) => v + '@');
                    setPlusOpen(false);
                    taRef.current?.focus();
                  }}
                >
                  <span className="v4-comp__plus-ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>
                  </span>
                  <span className="v4-comp__plus-t">Tag a deal</span>
                  <span className="v4-comp__plus-kbd">@</span>
                </button>
                <button
                  type="button"
                  className="v4-comp__plus-row"
                  onClick={() => {
                    setVal((v) => v + '#');
                    setPlusOpen(false);
                    taRef.current?.focus();
                  }}
                >
                  <span className="v4-comp__plus-ico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></svg>
                  </span>
                  <span className="v4-comp__plus-t">Reference a doc</span>
                  <span className="v4-comp__plus-kbd">#</span>
                </button>
                <div className="v4-comp__plus-sep" />
                <div className="v4-comp__plus-h">COMMANDS</div>
                {slashOptions.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className="v4-comp__plus-row"
                    onClick={() => {
                      setVal((v) => v + '/' + o.id + ' ');
                      setPlusOpen(false);
                      taRef.current?.focus();
                    }}
                  >
                    <span className="v4-comp__plus-ico">◆</span>
                    <span className="v4-comp__plus-t">{o.t}</span>
                    <span className="v4-comp__plus-kbd">/{o.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <textarea
            ref={taRef}
            className="v4-comp__ta"
            rows={1}
            value={val}
            placeholder={placeholder || 'What do you want to know?'}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            type="button"
            className={'v4-comp__send' + (val.trim() || files.length ? '' : ' v4-comp__send--idle')}
            onClick={send}
            disabled={!val.trim() && !files.length}
            title={val.trim() || files.length ? 'Send' : 'Dictate'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   V4Chat — root of the well
   ═══════════════════════════════════════════════════════════════════ */

interface Props {
  portfolio: Portfolio;
  onPortfolioChange: (id: string) => void;
  messages: ChatMessage[];
  onSend: (text: string, files?: ComposerFile[]) => void;
  isTyping: boolean;
  onOpenArtifact?: (a: ArtifactSpec) => void;
  width: number;
  onWidthChange: (w: number) => void;
}

export default function V4Chat({
  portfolio,
  onPortfolioChange,
  messages,
  onSend,
  isTyping,
  onOpenArtifact,
  width,
  onWidthChange,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const next = Math.max(300, Math.min(620, x - 84));
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

  const empty = messages.length === 0;
  const styleVars: React.CSSProperties = { ['--v4-chat-w' as any]: width + 'px' };

  return (
    <section className="v4-chat" style={styleVars}>
      <V4PortfolioSwitch portfolio={portfolio} onChange={onPortfolioChange} />

      {!empty && (
        <div className="v4-chat__head">
          <div className="v4-chat__head-t">{portfolio.name} · Main thread</div>
          <button type="button" className="v4-chat__head-btn" title="New thread">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button type="button" className="v4-chat__head-btn" title="History">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </button>
        </div>
      )}

      {empty ? (
        <V4ChatEmpty portfolio={portfolio} onStarter={(p) => onSend(p)} />
      ) : (
        <div className="v4-chat__scroll" ref={scrollRef}>
          {messages.map((m, i) => (
            <V4Msg key={i} who={m.who} text={m.text} progress={m.progress} artifacts={m.artifacts} onOpenArtifact={onOpenArtifact} />
          ))}
          {isTyping && <V4Typing />}
        </div>
      )}

      <V4Composer onSend={(text, files) => onSend(text, files)} placeholder={empty ? 'Ready to think…' : 'Reply to Yulia…'} />

      <div
        className={'v4-chat__grip' + (dragging ? ' v4-chat__grip--dragging' : '')}
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
      />
    </section>
  );
}
