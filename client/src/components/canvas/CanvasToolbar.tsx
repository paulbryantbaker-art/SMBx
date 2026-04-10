/**
 * Floating contextual toolbar for canvas tabs.
 * Sits above the active canvas card with pill actions, Canva-style.
 * Each canvas tab type can register its own actions.
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
      className="absolute top-3 left-1/2 -translate-x-1/2 z-20"
      style={{
        background: dark ? '#1A1C1E' : '#FFFFFF',
        border: dark ? '1px solid #2A2C2E' : '1px solid #E5E1D9',
        borderRadius: 100,
        boxShadow: dark
          ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)'
          : '0 1px 2px rgba(60,55,45,0.08), 0 4px 12px rgba(60,55,45,0.08)',
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
