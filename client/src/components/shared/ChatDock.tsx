import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';

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
}

/* ═══ COMPONENT ═══ */

const ChatDock = forwardRef<ChatDockHandle, ChatDockProps>(function ChatDock(
  { onSend, onFileUpload, disabled, placeholder = "Tell Yulia about your deal...", variant = 'dock' },
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
    onSend(t);
  }, [value, disabled, onSend]);

  /* Fill input from tool popup */
  const fillInput = useCallback((text: string) => {
    setValue(text);
    setToolsOpen(false);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + 'px';
        inputRef.current.focus();
      }
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
    <div className={isHero ? '' : 'shrink-0 bg-white border-t border-[rgba(26,26,24,0.06)]'} style={isHero ? undefined : { padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className={isHero ? '' : 'max-w-[860px] mx-auto pb-3 pt-2 lg:pb-4'}>
        <div className="home-dock-card relative" style={isHero ? { border: 'none', boxShadow: 'none', background: 'transparent', borderRadius: 0 } : undefined}>
          {/* Tool popup */}
          <div ref={toolsRef} className={`home-tools-popup ${toolsOpen ? 'open' : ''}`}>
            <div className="px-4 pt-3 pb-2">
              <span className="text-[12px] font-semibold tracking-wide uppercase text-[#A9A49C]">Start with Yulia</span>
            </div>
            {TOOLS.filter(t => t.group === 'journey').map(t => (
              <button key={t.label} className="home-tp-item" onClick={() => handleToolClick(t)} type="button">
                {t.icon}
                <div>
                  <div className="text-[15px] font-semibold text-[#1A1A18] leading-[1.3]">{t.label}</div>
                  <div className="text-[13px] text-[#6E6A63] leading-[1.4] mt-0.5">{t.desc}</div>
                </div>
              </button>
            ))}
            <div className="mx-4 my-1 border-t border-[#EBE7DF]" />
            <div className="px-4 pt-2 pb-1">
              <span className="text-[12px] font-semibold tracking-wide uppercase text-[#A9A49C]">Tools</span>
            </div>
            {TOOLS.filter(t => t.group === 'tool').map(t => (
              <button key={t.label} className="home-tp-item" onClick={() => handleToolClick(t)} type="button">
                {t.icon}
                <div>
                  <div className="text-[15px] font-semibold text-[#1A1A18] leading-[1.3]">{t.label}</div>
                  <div className="text-[13px] text-[#6E6A63] leading-[1.4] mt-0.5">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Attachment chips */}
          {attachment && (
            <div className="flex flex-wrap gap-2 px-4 pt-3 pb-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F3F0EA] rounded-lg max-w-[260px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4714E" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                <span className="text-[13px] font-medium text-[#1A1A18] truncate">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-[#A9A49C] hover:text-[#1A1A18] bg-transparent border-none cursor-pointer p-0 ml-0.5 flex-shrink-0" type="button">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className={isHero ? '' : 'mx-3 mt-2'} style={isHero ? undefined : { background: '#FAF9F7', borderRadius: '24px' }}>
            <textarea
              ref={inputRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKey}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none resize-none text-[17px] text-[#1A1A18] leading-[1.5] placeholder:text-[#A9A49C] lg:text-[18px]"
              style={{ fontFamily: 'inherit', minHeight: isHero ? '100px' : '52px', maxHeight: '200px', padding: '18px 22px 10px 22px' }}
              rows={isHero ? 3 : 1}
            />
          </div>

          {/* Toolbar row */}
          <div className="flex items-center justify-between px-4 pb-3.5 pt-0">
            <button
              ref={plusRef}
              onClick={() => setToolsOpen(prev => !prev)}
              className="w-9 h-9 rounded-full border-none bg-[#F3F0EA] text-[#8C877D] cursor-pointer flex items-center justify-center hover:bg-[#EBE7DF] active:scale-90"
              style={{ transition: 'all .2s' }}
              type="button"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-[#D4714E] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: toolsOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </button>
            <button
              onClick={send}
              className={`w-9 h-9 rounded-full border-none bg-[#D4714E] text-white cursor-pointer flex items-center justify-center hover:bg-[#BE6342] active:scale-90 ${hasContent && !disabled ? 'opacity-100 scale-100' : 'opacity-0 scale-[.8] pointer-events-none'}`}
              style={{ boxShadow: '0 2px 8px rgba(212,113,78,.3)', transition: 'all .2s' }}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l7-7 7 7" /><path d="M12 19V5" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatDock;
