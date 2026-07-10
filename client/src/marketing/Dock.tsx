/**
 * The ChatDock — the one input of the whole marketing surface (wireframe 5m):
 * pill shape, auto-expanding textarea (1–5 rows), circular terra send that is
 * visible only when there's text. Enter sends; Shift+Enter breaks the line.
 *
 * The shell renders one instance per surface slot; on mobile there is exactly
 * ONE instance (fixed bottom) so the morph never remounts it and the keyboard
 * is never dismissed (locked iOS rule, wireframe 5i).
 */
import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';

export interface DockHandle {
  focus(): void;
  seed(text: string): void;
}

interface DockProps {
  placeholder: string;
  onSend: (text: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}

export const Dock = forwardRef<DockHandle, DockProps>(function Dock(
  { placeholder, onSend, disabled, autoFocus, ariaLabel },
  ref,
) {
  const [value, setValue] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  // 5-row cap = line-height 1.45 × 16px × 5 (matches the CSS max-height).
  const MAX_H = 1.45 * 16 * 5;
  const autosize = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_H)}px`;
  }, [MAX_H]);

  useImperativeHandle(ref, () => ({
    focus: () => taRef.current?.focus(),
    seed: (text: string) => {
      setValue(text);
      requestAnimationFrame(() => {
        const ta = taRef.current;
        if (!ta) return;
        ta.focus();
        ta.setSelectionRange(text.length, text.length);
        autosize();
      });
    },
  }), [autosize]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue('');
    const ta = taRef.current;
    if (ta) ta.style.height = 'auto';
    onSend(text);
  };

  return (
    <div className={`mk-dock${value.trim() ? ' has-text' : ''}`}>
      <textarea
        ref={taRef}
        rows={1}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        autoFocus={autoFocus}
        onChange={e => { setValue(e.target.value); autosize(); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button type="button" className="mk-send" onClick={submit} disabled={disabled} aria-label="Send to Yulia">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
});
