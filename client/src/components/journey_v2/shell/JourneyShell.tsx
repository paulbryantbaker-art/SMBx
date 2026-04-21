/**
 * JourneyShell — public journey pages wearing the v4 app chrome.
 *
 * Same structure as V4Shell: left Tool rail, center-left Chat well,
 * right Canvas floating card. No right-side tab rail — journey pages
 * are linear scroll, not multi-tab. When a visitor on `/sell` hits Enter,
 * the morph into the logged-in `/chat` view is just Canvas content
 * swapping; the chrome stays put.
 *
 * Tokens + class names come from `../../app_v4/tokens.css` +
 * `../../app_v4/chrome/shell.css` (verbatim v4 design). No forks.
 *
 * Paul 2026-04-20: journey pages must match the app chrome exactly
 * so the morph from journey → chat feels like content swapping, not a
 * page change.
 */
import { useState, type ReactNode } from 'react';
import JourneyTool from './JourneyTool';
import JourneyChat, { type JourneyChatProps } from './JourneyChat';
import JourneyCanvas from './JourneyCanvas';
import type { DealTab } from '../deal-room';
/* Pull the v4 design-language stylesheet and tokens into the journey
   shell so the visitor experience and the logged-in app share every
   selector. Loading them here (instead of per-component) keeps the
   CSS order deterministic: tokens first, then shell primitives. */
import '../../app_v4/tokens.css';
import '../../app_v4/chrome/shell.css';
/* Claude Design v3 handoff: editorial system for journey pages. Load
   after v4-shell.css so page-specific overrides (composer, tool-rail
   account buttons, canvas__body padding) take precedence. */
import '../handoff_v3/page-overrides.css';
import '../handoff_v3/journey-content.css';
/* Handoff v4 Home: scoped under #home, only adds styles for the
   home page's `.h-*` vocabulary — harmless on other routes. */
import '../handoff_v4/home.css';
/* Page-specific overdrive sequences (cinematic content only; stays
   inside the .h-* vocabulary). Sell first — 3 automated visual stories. */
import '../handoff_v4/sell-overdrive.css';

export interface JourneyShellProps {
  /** Active journey route — drives the left rail highlight. */
  active: DealTab;
  /** Top-nav navigation handler — fires when the user picks a rail icon. */
  onNavigate: (dest: DealTab) => void;
  /** Called when the visitor clicks "Sign in" at the bottom of the rail. */
  onSignIn?: () => void;
  /** Called when the visitor clicks "Start free" at the bottom of the rail. */
  onStartFree: () => void;
  /** Chat-well config — scripted Yulia demo per page. */
  chat: Omit<JourneyChatProps, 'width' | 'onWidthChange'>;
  /** Canvas breadcrumb (handoff v3): kicker · title + optional right badge. */
  canvasKicker?: string;
  canvasTitle?: string;
  canvasBadge?: string;
  /** Deal steps + bottom close — content that scrolls inside the canvas. */
  children: ReactNode;
}

export default function JourneyShell({
  active, onNavigate, onSignIn, onStartFree, chat,
  canvasKicker, canvasTitle, canvasBadge,
  children,
}: JourneyShellProps) {
  /* Left-rail expand state — mirrors V4App.session's toolExpanded. Local
     for now; persist when we wire up real state. Expanded by default per
     Paul 2026-04-20 — labeled nav reads more inviting to first-time
     visitors than icon-only. */
  const [toolExpanded, setToolExpanded] = useState(true);

  /* Chat-well width — resizable grip inside JourneyChat. Default 420
     matches AuthV4Shell so the morph from logged-out to logged-in
     doesn\'t jump the chat column width. */
  const [chatWidth, setChatWidth] = useState(420);

  const vars: React.CSSProperties = {
    ['--v4-tool-w' as string]: (toolExpanded ? 184 : 56) + 'px',
    ['--v4-chat-w' as string]: chatWidth + 'px',
  };

  return (
    <div className="app-v4" data-density="comfortable">
      <div
        className="v4-shell journey-shell"
        data-tool={toolExpanded ? 'expanded' : 'collapsed'}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--v4-bg)',
          color: 'var(--v4-ink)',
          overflow: 'hidden',
          ...vars,
        }}
      >
        <JourneyTool
          active={active}
          onNavigate={onNavigate}
          onSignIn={onSignIn}
          onStartFree={onStartFree}
          expanded={toolExpanded}
          onToggle={() => setToolExpanded((v) => !v)}
        />
        <JourneyChat {...chat} width={chatWidth} onWidthChange={setChatWidth} />
        <JourneyCanvas
          crumbKicker={canvasKicker}
          crumbTitle={canvasTitle}
          crumbBadge={canvasBadge}
        >
          {children}
        </JourneyCanvas>
      </div>
    </div>
  );
}
