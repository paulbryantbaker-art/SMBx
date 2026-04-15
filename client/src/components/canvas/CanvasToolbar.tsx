/**
 * Floating contextual toolbar for canvas tabs.
 *
 * Top-center Apple Glass pill, Canva-inspired. Always floats over the
 * canvas content (never pushes it). Active canvas registers its actions
 * via getToolbarActionsFor(tab) in AppShell; when a tab has no actions
 * the toolbar hides gracefully instead of rendering an empty pill.
 *
 * Paired with FloatingCanvasTabBar at the bottom — the two bars form
 * the floating chrome for the desktop canvas panel.
 */
import { type ReactNode } from 'react';

export interface ToolbarAction {
  id: string;
  label: string;
  icon: string; // material symbol name
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  divider?: boolean; // render a vertical divider before this action
}

interface CanvasToolbarProps {
  actions: ToolbarAction[];
  dark?: boolean;
}

export default function CanvasToolbar({ actions, dark = false }: CanvasToolbarProps) {
  if (!actions.length) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={{
        top: 16,
        // Apple Glass — translucent + backdrop-filter. Matches the bottom
        // FloatingCanvasTabBar so the two floating pills read as one
        // coordinated chrome system.
        background: dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(15,16,18,0.08)',
        borderRadius: 999,
        boxShadow: dark
          ? '0 12px 32px -12px rgba(0,0,0,0.6)'
          : '0 12px 32px -12px rgba(0,0,0,0.2)',
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {actions.map((action, i): ReactNode => {
        const items: ReactNode[] = [];
        if (action.divider && i > 0) {
          items.push(
            <div
              key={`divider-${action.id}`}
              style={{
                width: 1,
                height: 20,
                background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                margin: '0 4px',
              }}
            />
          );
        }
        items.push(
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.label}
            type="button"
            className="canvas-toolbar-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 100,
              border: 'none',
              background: action.primary
                ? '#1A1C1E'
                : 'transparent',
              color: action.primary
                ? '#FFFFFF'
                : (dark ? '#E0DDD7' : '#1A1C1E'),
              fontSize: 13,
              fontWeight: 600,
              cursor: action.disabled ? 'not-allowed' : 'pointer',
              opacity: action.disabled ? 0.4 : 1,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: '-0.01em',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        );
        return items;
      })}
      <style>{`
        .canvas-toolbar-btn:not(:disabled):hover {
          background: ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} !important;
        }
        .canvas-toolbar-btn:not(:disabled):active {
          transform: scale(0.96);
        }
      `}</style>
    </div>
  );
}
