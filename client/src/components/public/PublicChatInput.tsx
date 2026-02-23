import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import YuliaAvatar from './YuliaAvatar';

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Show Yulia avatar alongside */
  showAvatar?: boolean;
  className?: string;
}

export default function PublicChatInput({
  onSend,
  disabled,
  placeholder = 'Ask Yulia anything about your deal\u2026',
  showAvatar = true,
  className = '',
}: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {showAvatar && <YuliaAvatar size={36} className="mt-1.5" />}
      <div className="flex-1 flex items-end gap-2 bg-white border border-[#E0DCD4] rounded-2xl px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] focus-within:border-[#DA7756] focus-within:shadow-[0_0_0_3px_rgba(218,119,86,0.08)] transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); resize(); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-[15px] text-[#1A1A18] placeholder-[#9B9891] font-sans leading-6 outline-none disabled:opacity-50 border-none p-0"
        />
        {hasText && (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="shrink-0 w-8 h-8 rounded-full bg-[#DA7756] text-white flex items-center justify-center border-none cursor-pointer hover:bg-[#C4684A] transition-colors disabled:opacity-50"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
