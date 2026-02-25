import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { useChatContext } from '../../context/ChatContext';

/* ─── Placeholder map ──────────────────────────────────────── */

const PLACEHOLDERS: Record<string, string> = {
  '/sell': 'Describe your business \u2014 industry, revenue, location\u2026',
  '/buy': "What kind of business are you looking to acquire?",
  '/raise': 'Tell Yulia about your raise \u2014 how much and why\u2026',
  '/integrate': 'Tell Yulia about your recent acquisition\u2026',
  '/': 'Tell Yulia about your business\u2026',
};

function getPlaceholder(page: string): string {
  return PLACEHOLDERS[page] || 'Ask Yulia anything about buying or selling a business\u2026';
}

/* ─── Component ────────────────────────────────────────────── */

interface Props {
  sourcePage: string;
  className?: string;
}

export default function PublicChatInput({ sourcePage, className = '' }: Props) {
  const { sendMessage, isStreaming } = useChatContext();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // Max ~4 lines (approx 96px)
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed, sourcePage);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <div className={`w-full max-w-2xl mx-auto px-4 ${className}`}>
      {/* Label */}
      <p className="text-xs text-[#9B9891] uppercase tracking-[.15em] font-medium mb-3 m-0">
        Talk to Yulia
      </p>

      {/* Input wrapper */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm hover:shadow transition-shadow flex items-end gap-2 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); resize(); }}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder(sourcePage)}
          rows={1}
          disabled={isStreaming}
          className="flex-1 resize-none bg-transparent outline-none text-[#1A1A18] text-base placeholder:text-[#9B9891] font-sans leading-relaxed border-none disabled:opacity-50"
        />

        {/* Send button — animated visibility */}
        <button
          onClick={handleSend}
          disabled={isStreaming || !hasContent}
          className="shrink-0 w-10 h-10 rounded-full bg-[#D4714E] text-white flex items-center justify-center border-none cursor-pointer hover:bg-[#BE6342] transition-all duration-200 ease-out disabled:cursor-default"
          style={{
            opacity: hasContent ? 1 : 0,
            transform: hasContent ? 'scale(1)' : 'scale(0.8)',
          }}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
