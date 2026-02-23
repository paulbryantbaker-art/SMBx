import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestedPrompts?: string[];
  className?: string;
}

export default function PublicChatInput({
  onSend,
  disabled,
  placeholder = 'Tell Yulia about your deal...',
  suggestedPrompts,
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

  const handleSuggestion = (prompt: string) => {
    if (disabled) return;
    onSend(prompt);
  };

  return (
    <div className={className}>
      {/* Input wrapper — matches prototype: 2px stone border, 20px radius */}
      <div className="bg-white border-2 border-[#E8E4DC] rounded-[20px] p-2 shadow-[0_8px_40px_rgba(0,0,0,0.04)] transition-all duration-300 focus-within:border-[#DA7756] focus-within:shadow-[0_8px_40px_rgba(218,119,86,0.1)]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); resize(); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          disabled={disabled}
          className="w-full border-none outline-none resize-none bg-transparent font-sans text-base text-[#1A1A18] placeholder-[#B5B1AA] leading-[1.5] px-5 pt-4 pb-2 disabled:opacity-50"
        />
        <div className="flex justify-between items-center px-3 pb-2 pt-1">
          <span className="text-xs text-[#7A766E]">Free to start &middot; No credit card</span>
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="w-10 h-10 rounded-xl bg-[#DA7756] text-white flex items-center justify-center border-none cursor-pointer hover:bg-[#C4684A] transition-colors disabled:opacity-30 disabled:cursor-default"
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggested prompts */}
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {suggestedPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSuggestion(prompt)}
              disabled={disabled}
              className="bg-white border border-[#E0DCD4] rounded-full px-[18px] py-2.5 text-[13px] font-medium text-[#4A4843] font-sans cursor-pointer transition-all duration-200 hover:border-[#DA7756] hover:text-[#DA7756] hover:bg-[#FFF0EB] disabled:opacity-50 disabled:cursor-default"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
