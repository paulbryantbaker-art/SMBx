/**
 * SDERecastCard — V17 hero artifact #1.
 *
 * A cream card styled like a financial worksheet. Renders a real-looking
 * SDE normalization: Reported Earnings → Add-backs (line items) →
 * Normalized SDE → Multiple Range → Indicative Valuation.
 *
 * variant="static"    — final state, no animation (use in persona previews)
 * variant="animated"  — builds line-by-line on mount/scroll (use in hero)
 *
 * Typography: Inter for labels, JetBrains Mono for numbers with
 * tabular-nums so columns align. Terra accent reserved for the final
 * valuation line — one of the six terra moments on the page.
 *
 * Per V17 brief, Part 1 — Visual artifact library, item #1.
 */
import { useEffect, useRef, useState, useMemo, type CSSProperties } from 'react';

export interface SDERecastCardProps {
  variant?: 'static' | 'animated';
  /** Start animation immediately on mount (hero). Otherwise waits for IntersectionObserver. */
  autoplay?: boolean;
  /** Optional className override for outer card. */
  className?: string;
  style?: CSSProperties;
}

type Row =
  | { kind: 'label'; text: string; sub?: string }
  | { kind: 'line'; label: string; value: string; tone?: 'default' | 'dim' }
  | { kind: 'divider' }
  | { kind: 'total'; label: string; value: string; sub?: string }
  | { kind: 'range'; label: string; value: string; sub?: string; terra?: boolean };

const ROWS: Row[] = [
  { kind: 'label', text: 'Industrial services · $1.8M revenue · Texas', sub: 'TTM figures, three-year tax returns defended' },
  { kind: 'line', label: 'Reported pre-tax earnings', value: '$612,400' },
  { kind: 'line', label: '+ Owner compensation (above market)', value: '$184,000', tone: 'dim' },
  { kind: 'line', label: '+ Personal vehicle & travel', value: '$38,200', tone: 'dim' },
  { kind: 'line', label: '+ One-time legal settlement', value: '$62,000', tone: 'dim' },
  { kind: 'line', label: '+ Family member payroll (non-working)', value: '$104,000', tone: 'dim' },
  { kind: 'divider' },
  { kind: 'total', label: 'Normalized SDE', value: '$1,000,600' },
  { kind: 'line', label: 'Multiple range (industry · revenue band)', value: '3.2× – 3.8×', tone: 'dim' },
  { kind: 'divider' },
  { kind: 'range', label: 'Indicative valuation', value: '$3.2M – $3.8M', sub: 'Quick-cash · local buyer · 90–120 days to close', terra: true },
];

export default function SDERecastCard({
  variant = 'animated',
  autoplay = false,
  className,
  style,
}: SDERecastCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(variant === 'static' ? ROWS.length : 0);

  const reduced = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (variant === 'static' || reduced) {
      setVisibleCount(ROWS.length);
      return;
    }

    const begin = () => {
      let i = 0;
      const tick = () => {
        i += 1;
        setVisibleCount(i);
        if (i < ROWS.length) {
          setTimeout(tick, 200);
        }
      };
      // Initial hold so the card frame is visible before lines populate.
      setTimeout(tick, 400);
    };

    if (autoplay || !rootRef.current) {
      begin();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            begin();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [variant, autoplay, reduced]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        width: '100%',
        maxWidth: 560,
        background: 'var(--canvas-cream, #FAF6EE)',
        border: '1px solid var(--rule, rgba(26,24,20,0.08))',
        borderRadius: 16,
        padding: '28px 32px 32px',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: 'var(--ink-primary, #1A1814)',
        boxShadow: '0 1px 2px rgba(26,24,20,0.04), 0 12px 32px rgba(26,24,20,0.06)',
        ...style,
      }}
    >
      {/* Worksheet header */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 16,
        borderBottom: '1px solid var(--rule, rgba(26,24,20,0.08))',
        marginBottom: 20,
      }}>
        <div>
          <div style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-tertiary, #8A8275)',
            marginBottom: 6,
          }}>
            Yulia · SDE recast
          </div>
          <div style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--ink-primary, #1A1814)',
          }}>
            Normalized earnings &amp; valuation
          </div>
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 11,
          color: 'var(--ink-tertiary, #8A8275)',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}>
          TTM · 2026
        </div>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ROWS.map((row, idx) => {
          const visible = idx < visibleCount;
          // Inline opacity/transform when this card is NOT inside an Edition
          // scroll-build wrapper. When wrapped (parent has [data-recast-card]),
          // CSS in index.css drives reveal off --recast-progress + --i.
          const base: CSSProperties = {
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 360ms cubic-bezier(0.22, 1, 0.36, 1), transform 360ms cubic-bezier(0.22, 1, 0.36, 1)',
            // The CSS var --i is read by .smbx-edition [data-recast-card]
            // [data-recast-row] to compute the per-row reveal threshold.
            ['--i' as string]: idx,
          };
          const recastAttrs: Record<string, string> = { 'data-recast-row': '' };
          if (row.kind === 'range') recastAttrs['data-recast-valuation'] = '';
          return <Line key={idx} row={row} style={base} attrs={recastAttrs} />;
        })}
      </div>
    </div>
  );
}

function Line({ row, style, attrs }: { row: Row; style: CSSProperties; attrs?: Record<string, string> }) {
  if (row.kind === 'label') {
    return (
      <div {...attrs} style={{ ...style, marginBottom: 16 }}>
        <div style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--ink-primary, #1A1814)',
          letterSpacing: '0.02em',
        }}>
          {row.text}
        </div>
        {row.sub && (
          <div style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12.5,
            color: 'var(--ink-tertiary, #8A8275)',
            marginTop: 4,
          }}>
            {row.sub}
          </div>
        )}
      </div>
    );
  }

  if (row.kind === 'divider') {
    return (
      <div {...attrs} style={{
        ...style,
        height: 1,
        background: 'var(--rule, rgba(26,24,20,0.08))',
        margin: '10px 0',
      }} />
    );
  }

  if (row.kind === 'line') {
    return (
      <div {...attrs} style={{
        ...style,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
        padding: '6px 0',
        fontSize: 14.5,
        color: row.tone === 'dim' ? 'var(--ink-secondary, #4A4438)' : 'var(--ink-primary, #1A1814)',
      }}>
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>{row.label}</span>
        <span style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
        }}>{row.value}</span>
      </div>
    );
  }

  if (row.kind === 'total') {
    return (
      <div {...attrs} style={{
        ...style,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
        padding: '10px 0',
      }}>
        <span style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: '-0.015em',
          color: 'var(--ink-primary, #1A1814)',
        }}>
          {row.label}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontWeight: 600,
          fontSize: 18,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--ink-primary, #1A1814)',
        }}>
          {row.value}
        </span>
      </div>
    );
  }

  // range — the terra moment
  return (
    <div {...attrs} style={{
      ...style,
      padding: '16px 0 4px',
    }}>
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: row.terra ? 'var(--accent-terra, #D4714E)' : 'var(--ink-tertiary, #8A8275)',
        marginBottom: 8,
      }}>
        {row.label}
      </div>
      <div style={{
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: '-0.025em',
        lineHeight: 1.05,
        color: row.terra ? 'var(--accent-terra, #D4714E)' : 'var(--ink-primary, #1A1814)',
        fontFeatureSettings: "'ss01', 'cv01', 'cv11', 'kern' 1",
        fontVariantNumeric: 'tabular-nums',
      }}>
        {row.value}
      </div>
      {row.sub && (
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          color: 'var(--ink-tertiary, #8A8275)',
          marginTop: 6,
        }}>
          {row.sub}
        </div>
      )}
    </div>
  );
}
