import type { ReactNode } from 'react';

interface CanvasShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  children: ReactNode;
}

export default function CanvasShell({ title, subtitle, onClose, onFullscreen, isFullscreen, children }: CanvasShellProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: '#FAF8F4' }}>
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{ padding: '12px 20px', borderBottom: '1px solid #DDD9D1' }}
      >
        <div className="min-w-0">
          <h2 className="font-sans m-0 truncate" style={{ fontSize: 16, fontWeight: 800, color: '#1A1A18' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="font-sans m-0" style={{ fontSize: 12, color: '#6E6A63', marginTop: 1 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="flex items-center justify-center cursor-pointer border-0"
              style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', color: '#6E6A63' }}
            >
              {isFullscreen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer border-0"
            style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', color: '#6E6A63' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
