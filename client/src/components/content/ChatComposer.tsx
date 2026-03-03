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

function ArrowUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export default function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = 'Tell Yulia about your deal...',
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
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
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

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full bg-white rounded-2xl flex items-end transition-all duration-200 ${
        isHero
          ? 'shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] border border-[#e0ddd7] focus-within:border-[#c9a08a] focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.1),0_0_0_1px_rgba(174,86,48,0.15)]'
          : 'shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035)] border border-[#e5e5e0] focus-within:border-[#c9a08a] focus-within:shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.05),0_0_0_1px_rgba(174,86,48,0.12)]'
      }`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none text-[16px] text-[#1A1A18] placeholder:text-[#9a958e] py-4 pl-5 pr-2 leading-[1.5]"
        style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif', minHeight: '26px', maxHeight: '160px' }}
      />
      <button
        type="submit"
        disabled={!hasContent || disabled}
        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 mr-3 mb-3 ${
          hasContent && !disabled
            ? 'bg-[#D4714E] text-white hover:bg-[#b8613d] shadow-sm cursor-pointer'
            : 'bg-[#EDEDEA] text-[#b5b0a8] cursor-default'
        }`}
      >
        <ArrowUp />
      </button>
    </form>
  );
}
