/**
 * YuliaAgent — the 3-state conversation chrome.
 *
 * States:
 *   full  — fullscreen chat. Tab bar hidden. Covers the app.
 *   mini  — glass strip above the tab bar. Always-visible "now playing" bar.
 *           Shows Yulia avatar, streaming task title, subtext, progress ring.
 *   side  — 42×42 half-pill on the right edge at bottom:104px. Out of the way
 *           for maximum reading space (doc fullscreen etc). Tap to restore mini.
 *
 * This is a skeleton — mini + side are wired, full is stubbed with a fade-in
 * sheet. The Apple Music layoutId avatar morph comes in task 20 polish pass.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { YuliaState } from '../types';
import type { AnonMessage } from '../../../hooks/useAnonymousChat';

interface Props {
  state: YuliaState;
  onStateChange: (next: YuliaState) => void;

  // Conversation surface
  messages: AnonMessage[];
  streamingText: string;
  sending: boolean;
  activeTool?: string | null;
  chatError?: string | null;
  onRetry?: () => void;

  onSend: (text: string) => void;
}

/** The Yulia avatar — dark charcoal → near-black gradient with inset highlight. */
function YAvatar({ size = 34, radius = 11 }: { size?: number; radius?: number }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(135deg, #3A3A3E 0%, #0A0A0B 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Sora', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: Math.round(size * 0.41),
        flexShrink: 0,
        boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      Y
    </div>
  );
}

/** Streaming progress indicator — a spinning quarter-circle. */
function Spinner() {
  return (
    <>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ animation: 'yulia-spin 1.2s linear infinite' }}
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      <style>{`@keyframes yulia-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default function YuliaAgent({
  state,
  onStateChange,
  messages,
  streamingText,
  sending,
  activeTool,
  chatError,
  onRetry,
  onSend,
}: Props) {
  const [draft, setDraft] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Auto-scroll the message list to the bottom whenever new content arrives
  // OR the visible viewport changes (keyboard open/close). We set scrollTop
  // directly (not scrollIntoView) because scrollIntoView walks ancestor
  // scrolls and can shift the whole dialog off-screen.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state !== 'full') return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, streamingText, state]);
  useEffect(() => {
    if (state !== 'full') return;
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    };
    vv.addEventListener('resize', handler);
    return () => vv.removeEventListener('resize', handler);
  }, [state]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    onSend(text);
    setDraft('');
  };

  const hasMessages = messages.length > 0;
  const latestAssistant = messages.filter((m) => m.role === 'assistant').slice(-1)[0];
  const latestAssistantPreview = latestAssistant?.content?.slice(0, 64);

  /* First-run state (no messages yet): surface an action-inviting prompt so
     the user understands the bar is tappable. Once a conversation exists,
     fall back to showing a preview of Yulia's latest message. */
  const title = sending
    ? activeTool || 'Thinking…'
    : hasMessages
      ? latestAssistantPreview || 'Continue the conversation'
      : 'Ask Yulia anything';
  const subtext = streamingText
    ? streamingText.slice(-60)
    : hasMessages
      ? latestAssistant?.content?.slice(64, 140) || ''
      : 'Your AI deal partner · tap to chat';

  if (state === 'side') {
    if (!mounted || typeof document === 'undefined') return null;
    return createPortal(
      <button
        type="button"
        onClick={() => onStateChange('mini')}
        aria-label="Restore Yulia mini bar"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 104,
          width: 42,
          height: 42,
          borderRadius: '21px 0 0 21px',
          background: 'linear-gradient(135deg, #3A3A3E, #0A0A0B)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 17,
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.15), -4px 4px 16px rgba(0,0,0,0.15)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Y
      </button>,
      document.body,
    );
  }

  if (state === 'full') {
    // Fullscreen chat — iMessage layering pattern.
    //   - Dialog fills 100dvh (shrinks with keyboard since we dropped
    //     viewport-fit=cover; see memory/feedback_pwa_chin_viewport_fit.md).
    //   - Scroll area fills the ENTIRE dialog (position:absolute inset:0).
    //     Messages scroll freely beneath the chrome.
    //   - Header + composer are position:absolute GLASS OVERLAYS on top.
    //     Messages scroll BEHIND them, partially visible through blur.
    //     Neither moves when the user scrolls — only content does.
    //   - Scroll area has padding-top / padding-bottom = chrome heights so
    //     the first message never starts under the header and the last
    //     clears the composer naturally.
    return (
      <div
        role="dialog"
        aria-label="Chat with Yulia"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100dvh',
          background: 'var(--bg-app)',
          zIndex: 50,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px 6px',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
            /* Same glass recipe as composer — elevated chrome, not a flat
               strip. Shadow BELOW the header (opposite direction from
               composer) so it reads as floating over content. */
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(30px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
            borderBottom: '0.5px solid rgba(0,0,0,0.06)',
            boxShadow: 'inset 0 -0.5px 0 rgba(255,255,255,0.9), 0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <button
            onClick={() => onStateChange('mini')}
            aria-label="Collapse chat"
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 15 12 21 18 15" />
            </svg>
          </button>
          <YAvatar size={28} radius={9} />
          <span style={{ width: 22 }} />
        </div>

        <div
          ref={scrollRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            /* padding-top clears the header. padding-bottom clears ONLY
               the composer height (~72) + safe-area + 8pt visible gap.
               When content overflows, scrolling lets messages slide
               UNDER the composer glass — which is where the backdrop-
               filter actually earns its keep (iMessage pattern). */
            padding: '68px 20px calc(env(safe-area-inset-bottom, 0px) + 80px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 14,
          }}
        >
          {messages.length === 0 ? (
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14,
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginTop: 40,
              }}
            >
              No messages yet. Start typing below.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={m.id || i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: m.role === 'user' ? '10px 13px' : '4px 0',
                  background: m.role === 'user' ? 'var(--bg-muted)' : 'transparent',
                  border: m.role === 'user' ? '0.5px solid var(--border)' : 'none',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : 0,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                  /* Allow hard breaks in unbroken long strings (URLs, IDs, stack traces) */
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {m.content}
              </div>
            ))
          )}
          {streamingText && (
            <div
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14.5,
                lineHeight: 1.55,
                color: 'var(--text-primary)',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {streamingText}
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: '1.1em',
                  background: 'var(--text-primary)',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  animation: 'yulia-blink 1s step-end infinite',
                }}
              />
              <style>{`@keyframes yulia-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
            </div>
          )}
          {chatError && (
            <div
              role="alert"
              style={{
                alignSelf: 'stretch',
                padding: '12px 14px',
                background: 'var(--band-flag-bg)',
                border: '0.5px solid var(--border)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--band-flag-fg)',
                  lineHeight: 1.5,
                }}
              >
                {chatError}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '7px 14px',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-primary-btn)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Try again
                </button>
              )}
            </div>
          )}
          {/* Bottom anchor — scrollIntoView target so the latest message
              stays visible just above the composer pill when the keyboard
              opens or new messages stream in. */}
        </div>

        {/* Full-mode composer — floating glass overlay, iMessage pattern.
            Even on a plain #F2F2F4 canvas, the composer reads as clearly
            ELEVATED (not part of the canvas) via:
            - brighter bg than canvas: rgba(255,255,255,0.85)
            - backdrop blur: blurs anything that scrolls underneath
            - top hairline border + inset highlight: specular "lift"
            - soft shadow ABOVE: 0 -8px 24px — the critical detail that
              communicates this is a floating layer, not a flat strip */}
        <form
          onSubmit={handleSubmit}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            padding: '8px 12px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(30px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.9), 0 -4px 24px rgba(0,0,0,0.06), 0 -1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: 'rgba(0,0,0,0.04)',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            +
          </span>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reply to Yulia…"
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 15,
              color: 'var(--text-primary)',
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: draft.trim() && !sending ? 'var(--accent)' : 'var(--bg-muted)',
              color: draft.trim() && !sending ? '#fff' : 'var(--text-faint)',
              border: 'none',
              cursor: draft.trim() && !sending ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: draft.trim() && !sending ? 'var(--shadow-primary-btn)' : 'none',
              transition: 'background 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    );
  }

  // state === 'mini' — the default. Floating Apple Glass pill above the
  // floating tab bar. iOS 26 Liquid Glass rhythm: two floating pills
  // stacked with breathing room, not two edge-to-edge strips.
  const miniStyle: CSSProperties = {
    position: 'absolute',
    left: 12,
    right: 12,
    /* Tab bar bottom = 10; tab bar height = 54; 8px gap → 72. */
    bottom: 72,
    height: 54,
    padding: '8px 10px 8px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    zIndex: 40,
    background: 'var(--glass-med)',
    backdropFilter: 'blur(40px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
    border: '0.5px solid var(--border)',
    /* Full pill — height / 2 for a true capsule feel. */
    borderRadius: 27,
    boxShadow:
      'inset 0 0.5px 0 rgba(255,255,255,0.9), 0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <button
      type="button"
      onClick={() => onStateChange('full')}
      aria-label="Open chat with Yulia"
      className="gg-glass-pill is-interactive"
      style={miniStyle}
    >
      {sending && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 1.5,
            width: '45%',
            background: 'var(--accent)',
            borderRadius: '0 2px 2px 0',
            opacity: 0.8,
          }}
        />
      )}
      <YAvatar size={34} radius={11} />
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.005em',
          }}
        >
          {title}
        </div>
        {subtext && (
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10.5,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.35,
              marginTop: 1,
            }}
          >
            {subtext}
          </div>
        )}
      </div>
      <span
        style={{
          position: 'relative',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: chatError ? 'var(--band-flag-bg)' : sending ? 'rgba(10,10,11,0.08)' : 'var(--accent)',
          color: chatError ? 'var(--band-flag-fg)' : sending ? 'var(--text-primary)' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: !chatError && !sending ? 'var(--shadow-primary-btn)' : 'none',
        }}
      >
        {chatError ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Error — tap to retry">
            <line x1="12" y1="8" x2="12" y2="13" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        ) : sending ? <Spinner /> : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        )}
      </span>
    </button>,
    document.body,
  );
}
