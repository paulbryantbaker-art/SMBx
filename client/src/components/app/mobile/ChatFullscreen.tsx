/**
 * ChatFullscreen — full-screen Yulia conversation overlay.
 *
 * Reads as a tab (active 'chat' tab in the tab bar), but actually renders as
 * a portaled overlay so the PWA keyboard/viewport infrastructure can stay
 * honest. Back chevron returns to the previous tab.
 *
 * PWA infrastructure (verbatim from YuliaAgent.full — do NOT change without
 * reading memory/feedback_pwa_chat_flex_layout.md):
 *   - createPortal(..., document.body) so position:absolute is body-relative
 *   - body is sized to var(--vvh) (visualViewport.height) via index.css, so
 *     the portal sees the visible viewport dimensions
 *   - html.yulia-chat-open toggles body un-fix (CSS in index.css) — essential
 *     so window.visualViewport reports the keyboard height correctly on iOS PWA
 *   - three independent absolute layers:
 *       BACK  = scrolling conversation (inset: 0, zIndex 1)
 *       FRONT = header (absolute top: 0, zIndex 2)
 *       FRONT = composer (absolute bottom: kbHeight, zIndex 2)
 *   - kbHeight = innerHeight - visualViewport.height, clamped to [0, 75%]
 *     of viewport to ignore garbage transients during the iOS keyboard animation
 *   - listen only to visualViewport.resize — NOT scroll (scroll is noisy on iOS)
 *   - NOT position:fixed — fixed uses the layout viewport which doesn't shrink
 *     with the keyboard in standalone PWA; position:absolute + body sized to
 *     var(--vvh) is the only pattern that survives all four launch contexts
 *     (Safari tab / iOS PWA / Chrome tab / Android PWA)
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AnonMessage } from '../../../hooks/useAnonymousChat';
import type { AppDeliverable } from '../types';
import type { MobileDeal } from './adaptDeals';
import InlineArtifact from './InlineArtifact';

interface Props {
  /** Only renders when true. */
  open: boolean;
  /** Active deal to show in the header. Null when user has no deals yet. */
  deal: MobileDeal | null;
  /** Deliverables across all user's deals — used by inline artifact cards. */
  deliverables: AppDeliverable[];
  messages: AnonMessage[];
  streamingText: string;
  sending: boolean;
  activeTool?: string | null;
  chatError?: string | null;
  onRetry?: () => void;
  onSend: (text: string) => void;
  /** Close the overlay (returns to previous tab). */
  onBack: () => void;
}

export default function ChatFullscreen({
  open,
  deal,
  deliverables,
  messages,
  streamingText,
  sending,
  activeTool: _activeTool,
  chatError,
  onRetry,
  onSend,
  onBack,
}: Props) {
  /* Pre-compute: which deliverable (if any) belongs to each assistant message?
     The server doesn't attach deliverable_id to messages in the auth path, so
     we use temporal proximity — a deliverable created within ±30s of an
     assistant message is "attached" to that message. This is stable because
     a single turn produces at most one deliverable in the current flow. */
  const artifactByMessageId = useMemo(() => {
    if (!deal) return new Map<number, AppDeliverable>();
    const dealDeliverables = deliverables
      .filter((d) => d.deal_id === deal.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const map = new Map<number, AppDeliverable>();
    const used = new Set<number>();
    for (const m of messages) {
      if (m.role !== 'assistant' || !m.created_at) continue;
      const msgT = new Date(m.created_at).getTime();
      const hit = dealDeliverables.find((d) => {
        if (used.has(d.id)) return false;
        const dT = new Date(d.created_at).getTime();
        return Math.abs(dT - msgT) < 30_000;
      });
      if (hit) {
        map.set(m.id, hit);
        used.add(hit.id);
      }
    }
    return map;
  }, [messages, deliverables, deal]);
  const [draft, setDraft] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Body un-fix while the chat is open so visualViewport works in PWA.
     CRITICAL: index.css:439 has `html.yulia-chat-open #root { display: none }`
     — if this class ever sticks on <html> while open=false, the ENTIRE
     APP DISAPPEARS (dark theme-color bg shows through, looking "blanked").
     This manifests most aggressively in installed PWA standalone mode.
     Cleanup is therefore bulletproof — removes the class unconditionally
     in every branch + the effect cleanup, so the class can never leak. */
  useEffect(() => {
    if (open) {
      document.documentElement.classList.add('yulia-chat-open');
    } else {
      document.documentElement.classList.remove('yulia-chat-open');
    }
    return () => document.documentElement.classList.remove('yulia-chat-open');
  }, [open]);

  /* Keyboard height tracking — clamped to ignore iOS transients. */
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const raw = window.innerHeight - vv.height;
      const clamped = Math.max(0, Math.min(window.innerHeight * 0.75, raw));
      setKbHeight(clamped);
    };
    update();
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, [open]);

  /* Auto-scroll to the latest message. useLayoutEffect + rAF so the scroll
     happens AFTER the browser lays out and paints new content. */
  const scrollRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [messages.length, streamingText, open]);

  /* Also re-scroll when the visible viewport resizes (keyboard open/close). */
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    };
    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
    return () => {
      vv.removeEventListener('resize', handler);
      vv.removeEventListener('scroll', handler);
    };
  }, [open]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    onSend(text);
    setDraft('');
  };

  if (!open || !mounted || typeof document === 'undefined') return null;

  const headerTitle = deal ? deal.name : 'Yulia';
  const headerSub = deal ? deal.stageLabel : 'Your AI deal partner';

  return createPortal(
    <div
      role="dialog"
      aria-label="Chat with Yulia"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg-app)',
        overflow: 'hidden',
      }}
    >
      {/* FRONT LAYER — header */}
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
          padding: '8px 12px 8px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          background: 'rgba(242,242,244,0.86)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          borderBottom: '0.5px solid var(--border)',
          boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.9)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.8)',
            border: '0.5px solid var(--border)',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.9)',
            WebkitTapHighlightColor: 'transparent',
            padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={{ flex: 1, minWidth: 0, textAlign: 'center', padding: '0 8px' }}>
          <div
            style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}
          >
            {headerTitle}
          </div>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: 1,
            }}
          >
            {sending ? 'Yulia is typing…' : headerSub}
          </div>
        </div>

        <span style={{ width: 36 }} aria-hidden />
      </div>

      {/* BACK LAYER — scrolling conversation */}
      <div
        ref={scrollRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          padding: `calc(env(safe-area-inset-top, 0px) + 72px) 16px ${80 + kbHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 12,
        }}
      >
        {messages.length === 0 && !streamingText ? (
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '40px 24px',
              lineHeight: 1.5,
            }}
          >
            {deal
              ? `Pick up the conversation about ${deal.name}.`
              : 'Tell Yulia about your business and she\u2019ll guide you from valuation to CIM.'}
          </div>
        ) : (
          messages.map((m, i) => {
            const artifact = typeof m.id === 'number' ? artifactByMessageId.get(m.id) : undefined;
            const bubble = (
              <div
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                  border: m.role === 'user' ? 'none' : '0.5px solid var(--border)',
                  borderRadius:
                    m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                  boxShadow: m.role === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            );
            return (
              <div
                key={m.id || i}
                style={{ display: 'flex', flexDirection: 'column', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', gap: 6 }}
              >
                {bubble}
                {artifact && deal && <InlineArtifact artifact={artifact} deal={deal} />}
              </div>
            );
          })
        )}

        {streamingText && (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '85%',
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border)',
              borderRadius: '18px 18px 18px 4px',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14.5,
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
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
                animation: 'mm-blink 1s step-end infinite',
              }}
            />
            <style>{`@keyframes mm-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
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
      </div>

      {/* FRONT LAYER — composer, anchored above keyboard via kbHeight */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'absolute',
          bottom: kbHeight,
          left: 0,
          right: 0,
          zIndex: 2,
          transition: 'bottom 0.15s ease-out',
          padding: '8px 12px',
          paddingBottom: kbHeight > 0 ? '8px' : 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 6px 6px 8px',
            minHeight: 48,
            borderRadius: 26,
            background: 'var(--bg-card)',
            border: '0.5px solid var(--border)',
            boxShadow:
              '0 6px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.9)',
          }}
        >
          <button
            type="button"
            aria-label="More"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={deal ? `Ask about ${deal.name}…` : 'Ask Yulia anything…'}
            className="mm-composer-input"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 16 /* 16px+ prevents iOS auto-zoom on focus */,
              color: 'var(--text-primary)',
              minWidth: 0,
              padding: '0 4px',
            }}
          />
          <style>{`
            .mm-composer-input::placeholder { color: var(--text-faint); }
          `}</style>

          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: draft.trim() && !sending ? 'var(--accent)' : 'rgba(0,0,0,0.06)',
              color: draft.trim() && !sending ? '#fff' : 'var(--text-muted)',
              border: 'none',
              cursor: draft.trim() && !sending ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
