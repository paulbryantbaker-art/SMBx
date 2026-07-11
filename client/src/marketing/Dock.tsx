/**
 * The ChatDock — the one input of the whole marketing surface (wireframe 5m):
 * pill shape, auto-expanding textarea (1–5 rows; the cap lives in CSS
 * max-height only), circular terra send that is visible only when there's
 * text. Enter sends; Shift+Enter breaks the line.
 *
 * The shell renders one instance per surface slot; on mobile there is exactly
 * ONE instance (fixed bottom) so the morph never remounts it and the keyboard
 * is never dismissed (locked iOS rule, wireframe 5i). seed() focuses
 * SYNCHRONOUSLY — iOS only raises the keyboard for focus inside the
 * user-gesture call stack.
 */
import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';

export interface DockHandle {
  focus(): void;
  seed(text: string): void;
}

interface DockProps {
  placeholder: string;
  /** Return true if the message was accepted; on false the text is KEPT so a
   *  send during streaming never silently eats what was typed. */
  onSend: (text: string) => boolean;
  disabled?: boolean;
}

export const Dock = forwardRef<DockHandle, DockProps>(function Dock(
  { placeholder, onSend, disabled },
  ref,
) {
  const [value, setValue] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Grow to content; the CSS max-height (calc(1.45em * 5)) clamps the cap.
  const autosize = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => taRef.current?.focus(),
    seed: (text: string) => {
      const ta = taRef.current;
      ta?.focus(); // synchronous — inside the tap's gesture stack (iOS keyboard)
      setValue(text);
      requestAnimationFrame(() => {
        const el = taRef.current;
        if (!el) return;
        el.setSelectionRange(text.length, text.length);
        autosize();
      });
    },
  }), [autosize]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    if (!onSend(text)) return; // rejected (mid-stream): keep the text
    setValue('');
    const ta = taRef.current;
    if (ta) ta.style.height = 'auto';
  };

  return (
    <div className={`mk-dock${value.trim() ? ' has-text' : ''}${disabled ? ' is-disabled' : ''}`}>
      <button
        type="button"
        className="mk-dock-plus"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => taRef.current?.focus()}
      >
        ＋
      </button>
      <textarea
        ref={taRef}
        rows={1}
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
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
