/**
 * NowYuliaBar — the "Now Playing" mini bar that floats above the tab bar.
 *
 * Hybrid state per user spec (2026-04-22):
 *   • Active — when activeTool or streamingText is live, show tool state
 *     with a pulsing dot. Examples: "Running ValueLens…", "Drafting CIM…".
 *   • Idle — once chat has been opened at least once this session AND chat
 *     is not currently open, show a muted preview of Yulia's last message
 *     (Apple Music's "last played" treatment).
 *
 * Hidden when:
 *   • Chat has never been opened this session (nothing to minimize).
 *   • The chat overlay is currently open (the bar would be behind it).
 *   • Deal detail sheet is open (competing chrome).
 *
 * Position: portaled to document.body, absolute bottom:72 (sits 10px above
 * the 54-high tab bar at bottom:10). Tapping it re-opens the chat overlay.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AnonMessage } from '../../../hooks/useAnonymousChat';

interface Props {
  /** True when chat overlay is currently showing — we hide then. */
  chatOpen: boolean;
  /** True if chat has been opened at least once in this session. */
  hasOpenedChat: boolean;
  /** Name of the tool Yulia is currently running, if any. */
  activeTool?: string | null;
  /** Streaming text buffer — if non-empty, Yulia is mid-reply. */
  streamingText: string;
  /** Full message list — we peek the last assistant turn for idle preview. */
  messages: AnonMessage[];
  /** Re-open the chat fullscreen overlay on tap. */
  onTap: () => void;
  /** If provided, hide the bar when true (e.g. detail sheet open). */
  hidden?: boolean;
}

/** Pretty-print a tool slug into something readable. */
function labelForTool(tool: string): string {
  const k = tool.toLowerCase();
  const map: Record<string, string> = {
    create_model_tab: 'Opening ValueLens',
    update_model: 'Updating model',
    read_tab_state: 'Checking canvas',
    get_sourcing_portfolio: 'Pulling sourcing',
    search_market_comps: 'Scanning comps',
    fetch_financials: 'Pulling financials',
    generate_cim: 'Drafting CIM',
    generate_loi: 'Drafting LOI',
    generate_rundown: 'Assembling rundown',
    run_valuation: 'Running ValueLens',
  };
  if (map[k]) return map[k];
  // Fallback: title-case the slug
  return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NowYuliaBar({
  chatOpen,
  hasOpenedChat,
  activeTool,
  streamingText,
  messages,
  onTap,
  hidden,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === 'undefined') return null;

  // Gate conditions — if any fail, don't render.
  if (hidden) return null;
  if (chatOpen) return null;
  if (!hasOpenedChat) return null;

  // Decide state — tool-active wins over idle-preview.
  const isActive = Boolean(activeTool || streamingText);

  let kicker: string;
  let body: string;

  if (isActive) {
    kicker = 'YULIA';
    body = activeTool
      ? `${labelForTool(activeTool)}…`
      : streamingText.length > 0
        ? 'Typing…'
        : 'Thinking…';
  } else {
    // Idle — grab the last assistant message's first line as the preview.
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) {
      kicker = 'YULIA';
      body = 'Tap to continue where you left off';
    } else {
      kicker = 'LAST FROM YULIA';
      const first = lastAssistant.content.split(/\n/).find((l) => l.trim().length > 0) || '';
      body = first.length > 84 ? first.slice(0, 84).trimEnd() + '…' : first;
    }
  }

  return createPortal(
    <button
      type="button"
      onClick={onTap}
      aria-label="Reopen Yulia chat"
      className="mm-nypill"
      data-active={isActive ? 'true' : 'false'}
    >
      <span className="mm-nypill__left">
        <span className="mm-nypill__dot" aria-hidden />
      </span>
      <span className="mm-nypill__body">
        <span className="mm-nypill__k">{kicker}</span>
        <span className="mm-nypill__t">{body}</span>
      </span>
      <span className="mm-nypill__chev" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </span>
    </button>,
    document.body,
  );
}
