import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { trackEvent } from '../../lib/analytics';

/* ═══ TOOL ITEMS ═══ */

interface ToolItem {
  label: string;
  desc: string;
  fill?: string;
  action?: 'upload';
  group?: 'journey' | 'tool';
  icon: React.ReactNode;
}

const TOOLS: ToolItem[] = [
  { group: 'journey', label: 'Sell my business', desc: 'Valuation, packaging, buyer matching, and closing', fill: 'I want to sell my business — ', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  { group: 'journey', label: 'Buy a business', desc: 'Thesis, sourcing, diligence, and deal structuring', fill: 'I want to buy a business — ', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
  { group: 'tool', label: 'Business valuation', desc: 'Multi-methodology estimate with defensible range', fill: 'I need a business valuation — I own a ', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { group: 'tool', label: 'SBA loan check', desc: 'Eligibility, DSCR analysis, and equity injection modeling', fill: "Can this deal get SBA financing? I'm looking at a ", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { group: 'tool', label: 'Capital structure', desc: 'Financing model — SBA, seller note, equity, mezzanine', fill: 'Help me figure out financing for a ', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { group: 'tool', label: 'Search for a business', desc: 'Define criteria and evaluate opportunities', fill: "Help me find a business — I'm looking for ", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { group: 'tool', label: 'Upload financials', desc: 'P&L, tax return, or balance sheet — PDF, XLSX, CSV', action: 'upload', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg> },
  { group: 'tool', label: 'Post-acquisition help', desc: '100-day plan, integration, synergy tracking', fill: "I just acquired a business and need help with ", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
];

/* ═══ Fisher-Yates shuffle ═══ */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══ PUBLIC HANDLE ═══ */

export interface ChatDockHandle {
  clear: () => void;
  focus: () => void;
}

/* ═══ PROPS ═══ */

interface ChatDockProps {
  onSend: (content: string) => void;
  onFileUpload?: (file: File) => Promise<{ name: string; size: string } | null>;
  disabled?: boolean;
  placeholder?: string;
  /** 'hero' = large textarea for landing page, 'dock' = compact for chat */
  variant?: 'hero' | 'dock';
  /** Override initial textarea rows (default: hero=3, dock=1) */
  rows?: number;
  /** Typewriter hint pool — typed out character-by-character (home page) */
  typewriterHints?: string[];
  /** Static prefix typed before each hint (e.g. "Hello, I'm Yulia, your M&A agent. ") */
  typewriterPrefix?: string;
  /** Called when hero textarea gains focus */
  onInputFocus?: () => void;
  /** Called when hero textarea loses focus — includes whether input has content */
  onInputBlur?: (hasContent: boolean) => void;
}

/* ═══ COMPONENT ═══ */

const ChatDock = forwardRef<ChatDockHandle, ChatDockProps>(function ChatDock(
  { onSend, onFileUpload, disabled, placeholder = "Tell Yulia about your deal...", variant = 'dock', rows, typewriterHints, typewriterPrefix = '', onInputFocus, onInputBlur },
  ref,
) {
  const isHero = variant === 'hero';
  const [value, setValue] = useState('');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = value.trim().length > 0;

  /* ═══ TYPEWRITER STATE ═══ */
  const [twText, setTwText] = useState('');
  const [twActive, setTwActive] = useState(true); // whether typewriter is running (paused on focus)
  const twTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const twIndexRef = useRef(0); // current hint index
  const twCharRef = useRef(0); // current char position in the full string
  const twPhaseRef = useRef<'typing' | 'holding' | 'clearing'>('typing');
  const twMirrorRef = useRef<HTMLDivElement>(null); // hidden mirror for auto-resize

  // Shuffle hints once on mount
  const shuffledHints = useMemo(() => {
    if (!typewriterHints || typewriterHints.length === 0) return [];
    return shuffle(typewriterHints);
  }, [typewriterHints]);

  // Track the shuffled order, reshuffle when exhausted
  const twOrderRef = useRef<string[]>(shuffledHints);
  useEffect(() => {
    twOrderRef.current = shuffledHints;
  }, [shuffledHints]);

  const hasTypewriter = shuffledHints.length > 0;
  const showTypewriter = hasTypewriter && !hasContent && !value && twActive;

  // Get the full string for current hint
  const getFullString = useCallback((hintIdx: number) => {
    const hints = twOrderRef.current;
    if (hints.length === 0) return '';
    return typewriterPrefix + hints[hintIdx % hints.length];
  }, [typewriterPrefix]);

  // Typewriter tick
  const tick = useCallback(() => {
    if (!hasTypewriter) return;

    const phase = twPhaseRef.current;
    const fullStr = getFullString(twIndexRef.current);

    if (phase === 'typing') {
      twCharRef.current++;
      const displayed = fullStr.slice(0, twCharRef.current);
      setTwText(displayed);

      if (twCharRef.current >= fullStr.length) {
        // Done typing — hold so user can read
        twPhaseRef.current = 'holding';
        twTimerRef.current = setTimeout(tick, 4500);
      } else {
        twTimerRef.current = setTimeout(tick, 45);
      }
    } else if (phase === 'holding') {
      // Clear and move to next hint
      twPhaseRef.current = 'clearing';
      setTwText('');
      twCharRef.current = 0;

      // Advance to next hint, reshuffle if exhausted
      twIndexRef.current++;
      if (twIndexRef.current >= twOrderRef.current.length) {
        twOrderRef.current = shuffle(twOrderRef.current);
        twIndexRef.current = 0;
      }

      // Small pause before starting next hint
      twTimerRef.current = setTimeout(() => {
        twPhaseRef.current = 'typing';
        tick();
      }, 200);
    }
  }, [hasTypewriter, getFullString]);

  // Start/stop typewriter
  useEffect(() => {
    if (!hasTypewriter) return;
    if (showTypewriter) {
      // Resume typing
      if (twPhaseRef.current === 'clearing') {
        twPhaseRef.current = 'typing';
      }
      twTimerRef.current = setTimeout(tick, twPhaseRef.current === 'typing' ? 28 : 200);
    }
    return () => {
      if (twTimerRef.current) clearTimeout(twTimerRef.current);
    };
  }, [showTypewriter, hasTypewriter, tick]);

  // Auto-resize the textarea based on typewriter mirror content
  useEffect(() => {
    if (!showTypewriter || !twMirrorRef.current || !inputRef.current) return;
    const mirrorH = twMirrorRef.current.scrollHeight;
    const minH = (rows ?? (isHero ? 3 : 1)) > 1 ? 100 : 56;
    inputRef.current.style.height = Math.max(mirrorH, minH) + 'px';
  }, [twText, showTypewriter, rows, isHero]);

  // When typewriter stops (user focused), reset textarea height
  useEffect(() => {
    if (!showTypewriter && inputRef.current && !hasContent) {
      inputRef.current.style.height = 'auto';
    }
  }, [showTypewriter, hasContent]);

  /* Focus/blur handlers for typewriter pause/resume */
  const handleFocus = useCallback(() => {
    setTwActive(false);
    setTwText('');
    if (twTimerRef.current) clearTimeout(twTimerRef.current);
    onInputFocus?.();
  }, [onInputFocus]);

  const handleBlur = useCallback(() => {
    if (!value.trim()) {
      // Resume typewriter — start fresh from current hint
      twCharRef.current = 0;
      twPhaseRef.current = 'typing';
      setTwActive(true);
    }
    onInputBlur?.(value.trim().length > 0);
  }, [value, onInputBlur]);

  /* Imperative handle for parent */
  useImperativeHandle(ref, () => ({
    clear() {
      setValue('');
      setToolsOpen(false);
      if (inputRef.current) inputRef.current.style.height = 'auto';
    },
    focus() {
      setTimeout(() => inputRef.current?.focus(), 100);
    },
  }), []);

  /* Send */
  const send = useCallback(() => {
    const t = value.trim();
    if (!t || disabled) return;
    setToolsOpen(false);
    setValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    trackEvent('message_sent');
    onSend(t);
  }, [value, disabled, onSend]);

  /* Fill input from tool popup. Belt-and-suspenders for iOS Safari:
     update both React state (setValue) AND the DOM value directly. If one
     gets clobbered by React reconciliation timing or a popup unmount race,
     the other paints. Also kill typewriter immediately so the placeholder
     overlay can't mask the new value. */
  const fillInput = useCallback((text: string) => {
    setTwActive(false);
    setTwText('');
    setValue(text);
    setToolsOpen(false);
    // Immediate DOM write — covers cases where React's render hasn't
    // committed yet but the user is already looking at the pill.
    const el = inputRef.current;
    if (el) {
      el.value = text;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    }
    // Deferred re-write + focus — covers cases where React's render commits
    // BETWEEN our DOM write and the user's next interaction, wiping the value.
    requestAnimationFrame(() => {
      const el2 = inputRef.current;
      if (!el2) return;
      if (el2.value !== text) el2.value = text;
      el2.focus();
      try { el2.setSelectionRange(text.length, text.length); } catch {}
    });
  }, []);

  /* Handle tool click — either fill or upload */
  const handleToolClick = useCallback((tool: ToolItem) => {
    if (tool.action === 'upload') {
      setToolsOpen(false);
      fileInputRef.current?.click();
    } else if (tool.fill) {
      fillInput(tool.fill);
    }
  }, [fillInput]);

  /* File upload handler */
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileUpload) return;

    setUploading(true);
    setToolsOpen(false);

    try {
      const result = await onFileUpload(file);
      if (result) {
        setAttachment(result);
      }
    } catch {
      // ignore upload errors
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onFileUpload]);

  /* Textarea handlers */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }, [send]);

  /* Click outside to close tools */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolsOpen &&
        toolsRef.current && !toolsRef.current.contains(e.target as Node) &&
        plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [toolsOpen]);

  return (
    <div className={isHero ? '' : 'shrink-0 border-t dock-outer'} style={isHero ? undefined : { padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      {/* Hidden file input — broad allowlist matched to server/routes/chat.ts.
          Google Docs and Office 365 docs are usually shared as URLs; users can
          paste those directly into the chat input and Yulia fetches the
          content. The accept list covers everything that actually gets
          uploaded as a file: documents (PDF/Word/text), spreadsheets
          (Excel/CSV), presentations (PowerPoint), and images. */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.rtf,.md,.xlsx,.xls,.csv,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.gif,.heic,.json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {isHero ? (
        /* ═══ HERO — Single-row pill bar (Paper design) ═══ */
        <div className="relative">
        <div
          className="home-dock-card dock-hero-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 100,
            padding: '6px 8px 6px 8px',
            gap: 8,
          }}
        >
          {/* + button — always visible.
              Signed-in (onFileUpload provided): opens native file picker.
              Signed-out (no onFileUpload): opens starter-prefills popup. */}
          <button
            ref={plusRef}
            type="button"
            onClick={() => {
              if (onFileUpload) {
                fileInputRef.current?.click();
              } else {
                setToolsOpen(p => !p);
              }
            }}
            aria-label={uploading ? 'Uploading…' : onFileUpload ? 'Attach a file' : 'Open starter options'}
            aria-expanded={!onFileUpload ? toolsOpen : undefined}
            disabled={uploading}
            className="dock-plus-btn flex items-center justify-center cursor-pointer active:scale-95"
            style={{
              width: 44, height: 44,
              borderRadius: '50%',
              border: '1.5px solid rgba(0,0,0,0.10)',
              color: 'currentColor',
              transition: 'all .2s',
              flexShrink: 0,
            }}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-[#D44A78] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: !onFileUpload && toolsOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>

          {/* Attachment chip — visible after a file is uploaded; click X to remove */}
          {attachment && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F5F5] rounded-full"
              style={{ flexShrink: 0, maxWidth: 200 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D44A78" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-[12px] font-medium text-[#1a1c1e] truncate">{attachment.name}</span>
              <button
                onClick={() => setAttachment(null)}
                className="bg-transparent border-none cursor-pointer p-0 ml-0.5 flex-shrink-0"
                style={{ color: 'rgba(0,0,0,0.35)' }}
                type="button"
                aria-label="Remove attachment"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Input area with typewriter */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: onFileUpload || attachment ? 0 : 16 }}>
            {showTypewriter && twText && (
              <div
                className="absolute pointer-events-none select-none"
                style={{ top: 0, bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', fontSize: '17px', color: 'rgba(0,0,0,0.45)', fontFamily: 'inherit', lineHeight: 1.5, overflow: 'hidden' }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {twText}
                  <span style={{ display: 'inline-block', width: 2, height: '1.1em', background: 'rgba(0,0,0,0.3)', marginLeft: 1, verticalAlign: 'text-bottom', animation: 'twBlink 1s step-end infinite' }} />
                </span>
              </div>
            )}
            <textarea
              ref={inputRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKey}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={showTypewriter ? '' : placeholder}
              autoComplete="off"
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
              name="yulia-chat-hero"
              enterKeyHint="send"
              className="w-full bg-transparent border-none outline-none resize-none text-[17px] text-[#1a1c1e] leading-[1.5] font-normal"
              style={{ fontFamily: 'inherit', minHeight: '48px', maxHeight: '160px', padding: '12px 0', color: 'rgba(0,0,0,1)' }}
              rows={1}
            />
          </div>

          {/* Send — greyed out idle, accent active, arrow up */}
          <button
            onClick={send}
            className="flex items-center justify-center border-none cursor-pointer active:scale-95"
            style={{
              width: 46, height: 46, borderRadius: '50%',
              background: hasContent && !disabled ? '#D44A78' : '#D8D8DA',
              color: hasContent && !disabled ? '#fff' : 'rgba(0,0,0,0.3)',
              transition: 'all .25s ease',
              flexShrink: 0,
              pointerEvents: hasContent && !disabled ? 'auto' : 'none',
            }}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l7-7 7 7" /><path d="M12 19V5" /></svg>
          </button>

          <style>{`
            .home-dock-card textarea::placeholder { color: rgba(0,0,0,0.45); }
            @keyframes twBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          `}</style>
        </div>

        {/* Starter-prefill popup — shown only when not signed-in (no onFileUpload).
            Mirrors the mobile + popup. Drops UP from the pill. */}
        {!onFileUpload && (
          <div ref={toolsRef} className={`home-tools-popup ${toolsOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 12px)' }}>
            <div className="px-4 pt-3 pb-2">
              <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(0,0,0,0.35)' }}>Start with Yulia</span>
            </div>
            {TOOLS.filter(t => t.group === 'journey').map(t => (
              <button key={t.label} className="home-tp-item" onClick={() => handleToolClick(t)} type="button">
                {t.icon}
                <div>
                  <div className="text-[15px] font-semibold text-[#1a1c1e] leading-[1.3]">{t.label}</div>
                  <div className="text-[13px] leading-[1.4] mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>{t.desc}</div>
                </div>
              </button>
            ))}
            <div className="mx-4 my-1" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />
            <div className="px-4 pt-2 pb-1">
              <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(0,0,0,0.35)' }}>Tools</span>
            </div>
            {TOOLS.filter(t => t.group === 'tool').map(t => (
              <button key={t.label} className="home-tp-item" onClick={() => handleToolClick(t)} type="button">
                {t.icon}
                <div>
                  <div className="text-[15px] font-semibold text-[#1a1c1e] leading-[1.3]">{t.label}</div>
                  <div className="text-[13px] leading-[1.4] mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        </div>
      ) : (
      <div className="max-w-[860px] mx-auto pb-3 pt-2 lg:pb-4">
        <div className="home-dock-card relative">
          {/* Tool popup */}
          <div ref={toolsRef} className={`home-tools-popup ${toolsOpen ? 'open' : ''}`}>
            <div className="px-4 pt-3 pb-2">
              <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(0,0,0,0.35)' }}>Start with Yulia</span>
            </div>
            {TOOLS.filter(t => t.group === 'journey').map(t => (
              <button key={t.label} className="home-tp-item" onClick={() => handleToolClick(t)} type="button">
                {t.icon}
                <div>
                  <div className="text-[15px] font-semibold text-[#1a1c1e] leading-[1.3]">{t.label}</div>
                  <div className="text-[13px] leading-[1.4] mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>{t.desc}</div>
                </div>
              </button>
            ))}
            <div className="mx-4 my-1" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />
            <div className="px-4 pt-2 pb-1">
              <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(0,0,0,0.35)' }}>Tools</span>
            </div>
            {TOOLS.filter(t => t.group === 'tool').map(t => (
              <button key={t.label} className="home-tp-item" onClick={() => handleToolClick(t)} type="button">
                {t.icon}
                <div>
                  <div className="text-[15px] font-semibold text-[#1a1c1e] leading-[1.3]">{t.label}</div>
                  <div className="text-[13px] leading-[1.4] mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Attachment chips */}
          {attachment && (
            <div className="flex flex-wrap gap-2 px-4 pt-3 pb-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F5F5] rounded-lg max-w-[260px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D44A78" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                <span className="text-[13px] font-medium text-[#1a1c1e] truncate">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="hover:text-[#1a1c1e] bg-transparent border-none cursor-pointer p-0 ml-0.5 flex-shrink-0" style={{ color: 'rgba(0,0,0,0.35)' }} type="button">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* Textarea + typewriter overlay */}
          <div className={isHero ? 'relative' : 'mx-3 mt-2 relative dock-textarea-bg'} style={isHero ? undefined : { borderRadius: '24px' }}>
            {/* Typewriter overlay */}
            {showTypewriter && twText && (
              <div
                className="absolute pointer-events-none select-none"
                style={{ top: '16px', left: '18px', right: '18px', fontSize: '17px', color: 'rgba(0,0,0,0.55)', fontFamily: 'inherit', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {twText}
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: '1.1em',
                    background: 'rgba(0,0,0,0.35)',
                    marginLeft: 1,
                    verticalAlign: 'text-bottom',
                    animation: 'twBlink 1s step-end infinite',
                  }}
                />
              </div>
            )}
            {/* Hidden mirror div for auto-resize measurement */}
            {showTypewriter && (
              <div
                ref={twMirrorRef}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  visibility: 'hidden',
                  fontSize: '17px',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  padding: '16px 18px 10px 18px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  pointerEvents: 'none',
                }}
              >
                {twText || '\u00A0'}
              </div>
            )}
            <textarea
              ref={inputRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKey}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={showTypewriter ? '' : placeholder}
              autoComplete="off"
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
              name="yulia-chat-dock"
              enterKeyHint="send"
              className="w-full bg-transparent border-none outline-none resize-none text-[17px] text-[#1a1c1e] leading-[1.5] font-normal"
              style={{ fontFamily: 'inherit', minHeight: (rows ?? (isHero ? 3 : 1)) > 1 ? '100px' : '56px', maxHeight: '200px', padding: '16px 18px 10px 18px', color: 'rgba(0,0,0,1)' }}
              rows={rows ?? (isHero ? 3 : 1)}
            />
            <style>{`
              .home-dock-card textarea::placeholder { color: rgba(0,0,0,0.55); }
              @keyframes twBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            `}</style>
          </div>

          {/* Toolbar row */}
          <div className="flex items-center justify-between px-3 pb-3 pt-0">
            <button
              ref={plusRef}
              onClick={() => setToolsOpen(prev => !prev)}
              className="flex items-center justify-center dock-plus-btn cursor-pointer active:scale-95"
              aria-label={toolsOpen ? 'Close tools' : 'Open tools'}
              style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.06)', transition: 'all .2s', color: 'rgba(0,0,0,0.4)' }}
              type="button"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-[#D44A78] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: toolsOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </button>
            <button
              onClick={send}
              className="flex items-center justify-center border-none cursor-pointer active:scale-95"
              aria-label="Send message"
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: hasContent && !disabled ? '#D44A78' : '#D8D8DA',
                color: hasContent && !disabled ? '#fff' : 'rgba(0,0,0,0.3)',
                transition: 'all .2s',
                pointerEvents: hasContent && !disabled ? 'auto' : 'none',
              }}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l7-7 7 7" /><path d="M12 19V5" /></svg>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
});

export default ChatDock;
