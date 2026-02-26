import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';

/* ═══ TOOL ITEMS ═══ */

interface ToolItem {
  label: string;
  desc: string;
  fill?: string;
  action?: 'upload';
  icon: React.ReactNode;
}

const TOOLS: ToolItem[] = [
  { label: 'Upload financials', desc: 'Share a P&L, tax return, or balance sheet', action: 'upload', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg> },
  { label: 'Business valuation', desc: 'Estimate worth based on revenue, earnings, and comps', fill: 'I need a business valuation — I own a ', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg> },
  { label: 'Search for a business', desc: 'Find businesses by industry, location, size, or price', fill: "Help me find a business — I'm looking for ", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
  { label: 'SBA loan check', desc: 'See if a deal qualifies for SBA 7(a) — up to $5M, 10% down', fill: "Can this deal get SBA financing? I'm looking at a ", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
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
}

/* ═══ COMPONENT ═══ */

const ChatDock = forwardRef<ChatDockHandle, ChatDockProps>(function ChatDock(
  { onSend, onFileUpload, disabled, placeholder = "Tell Yulia about your deal..." },
  ref,
) {
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
    <div className="shrink-0 px-3 md:px-5 bg-[#FAF8F4]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="max-w-[640px] mx-auto pb-2 pt-2">
        <div className="home-dock-card relative">
          {/* Tool popup */}
          <div ref={toolsRef} className={`home-tools-popup ${toolsOpen ? 'open' : ''}`}>
            {TOOLS.map(t => (
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
            <div className="flex flex-wrap gap-2 px-3.5 pt-3 pb-0">
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
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none resize-none text-[16px] text-[#1A1A18] leading-[1.5] placeholder:text-[#A9A49C] lg:text-[17px]"
            style={{ fontFamily: 'inherit', minHeight: '24px', maxHeight: '160px', padding: '12px 16px 4px 16px' }}
            rows={1}
          />

          {/* Toolbar row */}
          <div className="flex items-center justify-between px-2 pb-2 pt-0.5">
            <button
              ref={plusRef}
              onClick={() => setToolsOpen(prev => !prev)}
              className="w-8 h-8 rounded-full border-none bg-[#F3F0EA] text-[#8C877D] cursor-pointer flex items-center justify-center hover:bg-[#EBE7DF] active:scale-90"
              style={{ transition: 'all .2s' }}
              type="button"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-[#D4714E] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: toolsOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </button>
            <button
              onClick={send}
              className={`w-8 h-8 rounded-full border-none bg-[#D4714E] text-white cursor-pointer flex items-center justify-center hover:bg-[#BE6342] active:scale-90 ${hasContent && !disabled ? 'opacity-100 scale-100' : 'opacity-0 scale-[.8] pointer-events-none'}`}
              style={{ boxShadow: '0 2px 8px rgba(212,113,78,.3)', transition: 'all .2s' }}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l7-7 7 7" /><path d="M12 19V5" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatDock;
