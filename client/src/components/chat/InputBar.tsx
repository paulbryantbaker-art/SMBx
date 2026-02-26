import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import Button from '../ui/Button';

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
    el.style.height = Math.min(el.scrollHeight, 144) + 'px';
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
    <div className="shrink-0 bg-white border-t border-border">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); resize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Yulia anything about your deal..."
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-base text-text-primary placeholder-text-tertiary font-[system-ui,sans-serif] leading-6 focus:outline-none focus:ring-2 focus:ring-terra focus:border-transparent transition-colors duration-150 disabled:opacity-50"
          />
          {hasText && (
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={disabled}
              className="!h-10 !w-10 !min-w-0 !rounded-full !p-0 flex items-center justify-center shrink-0"
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
