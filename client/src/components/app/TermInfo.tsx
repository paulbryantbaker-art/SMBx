/**
 * TermInfo — inline (i) info icon that opens a Glass Grok definition card.
 *
 * Used to gloss M&A jargon (SDE, CIM, add-back, multiple) in context so
 * first-time sellers aren't lost in acronyms. Monochrome discipline:
 * the icon is a thin-bordered grey circle with a lowercase `i` — no
 * accent color.
 *
 * Interaction: tap icon → small centered card fades in with the term +
 * 1-2 sentence definition. Tap backdrop OR press Esc → close.
 */

import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  term: string;
  definition: ReactNode;
  /** Optional longer name to show as the card headline. Defaults to `term`. */
  fullName?: string;
}

export default function TermInfo({ term, definition, fullName }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={`What is ${term}?`}
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 14,
          height: 14,
          borderRadius: '50%',
          border: '0.5px solid var(--text-muted)',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontFamily: 'ui-serif, Georgia, "Times New Roman", serif',
          fontSize: 10,
          fontWeight: 700,
          fontStyle: 'italic',
          marginLeft: 4,
          marginRight: 2,
          verticalAlign: 'middle',
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
          WebkitTapHighlightColor: 'transparent',
          transition: 'border-color 150ms ease, color 150ms ease',
        }}
      >
        i
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close definition"
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10,10,11,0.28)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              border: 'none',
              cursor: 'default',
              zIndex: 998,
              padding: 0,
            }}
          />
          <div
            role="dialog"
            aria-labelledby="term-info-title"
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(320px, calc(100vw - 40px))',
              padding: '20px 22px',
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border)',
              borderRadius: 18,
              boxShadow: 'var(--shadow-inset-highlight), 0 12px 40px rgba(0,0,0,0.18)',
              zIndex: 999,
              color: 'var(--text-primary)',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <h4
              id="term-info-title"
              style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--text-primary)',
                margin: '0 0 8px',
                letterSpacing: '-0.005em',
              }}
            >
              {fullName || term}
            </h4>
            <div
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {definition}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '9px 14px',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                border: '0.5px solid var(--border)',
                borderRadius: 10,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Got it
            </button>
          </div>
        </>
      )}
    </>
  );
}
