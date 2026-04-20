/**
 * AuthV4Shell — V4 chrome wired to the real auth chat backend.
 *
 * Renders V4Tool (left floating rail) + V4Chat (center-left chat well) and
 * surfaces a `canvasSlot` on the right where AppShell plugs in its
 * existing canvas-panel JSX (deliverables, models, data rooms, etc.).
 * Keeps one source of truth for the real app's canvas + tabs — we only
 * reskin the chrome around it.
 *
 * Message shape adapter:
 *   AuthMessage { role, content } → V4 ChatMessage { who, text }
 */

import { useMemo, useState, type ReactNode } from 'react';
import V4Tool from '../chrome/V4Tool';
import V4Chat from '../chrome/V4Chat';
import { PORTFOLIOS } from '../data';
import type { ChatMessage, V4UIState } from '../session';
import type { AuthMessage } from '../../../hooks/useAuthChat';
import GateProgress from '../../chat/GateProgress';
import { ChapterStrip } from '../../shared/ChapterStrip';
import '../tokens.css';
import '../chrome/shell.css';

interface DealChapter {
  id: number;
  title: string;
  gate_label?: string | null;
  gate_status?: string;
  summary?: string | null;
}

interface Props {
  messages: AuthMessage[];
  streamingText: string;
  sending: boolean;
  onSend: (text: string) => void;
  /** Active deal ID for gate progress bar. Null for general conversations. */
  activeDealId?: number | null;
  currentGate?: string;
  /** Conversations within the active deal — chapter strip when > 1. */
  chapters?: DealChapter[];
  activeChapterId?: number | null;
  onSelectChapter?: (id: number) => void;
  /** Host-provided canvas content rendered in the right floating card.
      AppShell passes its existing canvas-panel JSX here. */
  canvasSlot?: ReactNode;
  /** Optional inline slot after the last message (e.g. PaywallCard). */
  messagesFooterSlot?: ReactNode;
}

export default function AuthV4Shell({
  messages, streamingText, sending, onSend,
  activeDealId, currentGate, chapters, activeChapterId, onSelectChapter,
  canvasSlot, messagesFooterSlot,
}: Props) {
  const [ui, setUI] = useState<V4UIState>({
    mode: 'desktop',
    density: 'comfortable',
    railShown: false,
    chatW: 420,
    dmOpen: false,
    toolExpanded: true,
  });

  const portfolio = PORTFOLIOS[0];
  const patchUI = (patch: Partial<V4UIState>) => setUI((prev) => ({ ...prev, ...patch }));

  const v4Messages: ChatMessage[] = useMemo(() => {
    const mapped: ChatMessage[] = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        who: m.role === 'user' ? 'me' : 'y',
        text: m.content,
      }));
    if (streamingText) {
      mapped.push({ who: 'y', text: streamingText });
    }
    return mapped;
  }, [messages, streamingText]);

  const showChapters = !!chapters && chapters.length > 1 && !!onSelectChapter;
  const showGates = !!activeDealId;
  const chatHeaderSlot = (showGates || showChapters) ? (
    <div className="v4-chat__deal-head">
      {showChapters && (
        <ChapterStrip
          chapters={chapters!.map((c) => ({
            id: c.id,
            title: c.title,
            gate_label: c.gate_label ?? undefined,
            gate_status: c.gate_status,
            summary: c.summary ?? undefined,
          }))}
          activeChapterId={activeChapterId ?? null}
          onChapterTap={onSelectChapter!}
          dark={false}
        />
      )}
      {showGates && <GateProgress dealId={activeDealId!} currentGate={currentGate} />}
    </div>
  ) : null;

  const vars: React.CSSProperties = {
    ['--v4-tool-w' as string]: (ui.toolExpanded ? 184 : 56) + 'px',
    ['--v4-chat-w' as string]: ui.chatW + 'px',
  };

  return (
    <div className="app-v4 app-v4--desktop" data-density={ui.density} style={{ position: 'absolute', inset: 0 }}>
      <div
        className="v4-shell"
        data-tool={ui.toolExpanded ? 'expanded' : 'collapsed'}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--v4-bg)',
          color: 'var(--v4-ink)',
          overflow: 'hidden',
          ...vars,
        }}
      >
        <V4Tool
          expanded={ui.toolExpanded}
          onToggle={() => patchUI({ toolExpanded: !ui.toolExpanded })}
        />
        <V4Chat
          portfolio={portfolio}
          onPortfolioChange={() => {/* single-workspace */}}
          messages={v4Messages}
          onSend={(text) => { if (!sending) onSend(text); }}
          isTyping={sending && !streamingText}
          width={ui.chatW}
          onWidthChange={(w) => patchUI({ chatW: w })}
          headerSlot={chatHeaderSlot}
          messagesFooterSlot={messagesFooterSlot}
        />
        {/* Canvas floating card — host-provided content (AppShell's real
            deliverable/model/dataroom tabs). Positioned to the right of the
            chat well with the same 14px inset V4Canvas uses. */}
        <div
          className="v4-canvas"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            bottom: 14,
            left: 'calc(var(--v4-tool-w) + 14px + var(--v4-chat-w) + 14px)',
            background: 'var(--v4-card)',
            border: '0.5px solid var(--v4-card-line)',
            borderRadius: 20,
            boxShadow: 'var(--v4-shadow-md)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {canvasSlot ?? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--v4-mute)',
              fontSize: 14,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Artifacts Yulia generates will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
