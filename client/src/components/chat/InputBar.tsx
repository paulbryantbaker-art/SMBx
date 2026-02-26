import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

interface InputBarProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="shrink-0 px-3 md:px-5 bg-[#FAF8F4]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-[640px] mx-auto pb-2 pt-2">
        <div
          style={{
            background: 'white',
            border: '1px solid rgba(196, 168, 130, 0.3)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); resize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Tell Yulia about your deal..."
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent border-none outline-none resize-none text-[16px] text-[#1A1A18] leading-[1.5] placeholder:text-[#A9A49C] lg:text-[17px] disabled:opacity-50"
            style={{ fontFamily: 'inherit', minHeight: '24px', maxHeight: '160px', padding: '12px 16px 4px 16px' }}
          />
          <div className="flex items-center justify-between px-2 pb-2 pt-0.5">
            <button
              className="w-8 h-8 rounded-full border-none bg-[#F3F0EA] text-[#8C877D] cursor-pointer flex items-center justify-center hover:bg-[#EBE7DF] active:scale-90"
              style={{ transition: 'all .2s' }}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              onClick={handleSend}
              className={`w-8 h-8 rounded-full border-none bg-[#D4714E] text-white cursor-pointer flex items-center justify-center hover:bg-[#BE6342] active:scale-90 ${hasText && !disabled ? 'opacity-100 scale-100' : 'opacity-0 scale-[.8] pointer-events-none'}`}
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
}
