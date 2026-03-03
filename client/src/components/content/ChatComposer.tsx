import { useRef, useCallback, useEffect } from 'react';

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'hero' | 'docked';
  autoFocus?: boolean;
}

export default function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = 'Message Yulia or paste a listing URL...',
  disabled = false,
  variant = 'hero',
  autoFocus = false,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = value.trim().length > 0;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasContent && !disabled) onSend();
    }
  }, [hasContent, disabled, onSend]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (hasContent && !disabled) onSend();
  }, [hasContent, disabled, onSend]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 100);
    }
  }, [autoFocus]);

  // Reset textarea height when value is cleared
  useEffect(() => {
    if (!value && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value]);

  const isDocked = variant === 'docked';

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full bg-white border border-[#EAE6DF] rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        isDocked
          ? 'shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035)] focus-within:shadow-[0_8px_30px_rgba(212,113,78,0.12)] focus-within:border-[#D4714E]/50'
          : 'shadow-[0_4px_12px_rgba(212,113,78,0.04)] focus-within:shadow-[0_8px_30px_rgba(212,113,78,0.12)] focus-within:border-[#D4714E]/50 focus-within:ring-4 focus-within:ring-[#FFF0EB]'
      }`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        className="w-full bg-transparent border-none focus:outline-none text-[16px] md:text-[18px] text-[#1A1A18] placeholder:text-[#A9A49C] p-5 resize-none min-h-[80px]"
        style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif', maxHeight: '200px' }}
      />

      {/* Footer: status + send */}
      <div className="flex items-center justify-between px-5 pb-4 pt-1">
        <div className="text-xs text-[#A9A49C] font-bold tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Federal Data Sync Active
        </div>
        <button
          type="submit"
          disabled={!hasContent || disabled}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-sm ${
            hasContent && !disabled
              ? 'bg-[#D4714E] text-white hover:bg-[#b8613d] cursor-pointer'
              : 'bg-[#D4714E] text-white opacity-50 shadow-none cursor-default'
          }`}
        >
          EXECUTE{' '}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-px ml-1">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </form>
  );
}
