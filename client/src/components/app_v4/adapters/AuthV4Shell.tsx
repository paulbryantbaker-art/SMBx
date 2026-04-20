/**
 * AuthV4Shell — V4 chrome wired to the real auth chat backend.
 *
 * Composes V4Shell + V4Tool + V4Chat + V4Canvas + V4Rail against
 * `useAuthChat()` state (messages, sending, handleSend). Lets
 * AppShell render V4 look + feel on desktop /chat while keeping
 * one source of truth for auth/session/overlays.
 *
 * Message shape adapter:
 *   AuthMessage { role: 'user'|'assistant'|'system', content }
 *     → V4 ChatMessage { who: 'me'|'y', text }
 *
 * Canvas/Rail are passive for now (no tabs). Tabs open when the user
 * clicks a deliverable — wire later.
 */

import { useMemo, useState } from 'react';
import V4Shell from '../chrome/V4Shell';
import V4Tool from '../chrome/V4Tool';
import V4Chat from '../chrome/V4Chat';
import V4Canvas from '../chrome/V4Canvas';
import V4Rail from '../chrome/V4Rail';
import { PORTFOLIOS } from '../data';
import type { ChatMessage, V4UIState, Tab } from '../session';
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
  /** Active deal ID for gate progress bar. Null when the user is in a
      general (non-deal) conversation. */
  activeDealId?: number | null;
  currentGate?: string;
  /** Conversations within the active deal — shown as a horizontal
      chapter strip above the messages when > 1. */
  chapters?: DealChapter[];
  activeChapterId?: number | null;
  onSelectChapter?: (id: number) => void;
}

export default function AuthV4Shell({
  messages, streamingText, sending, onSend,
  activeDealId, currentGate, chapters, activeChapterId, onSelectChapter,
}: Props) {
  const [ui, setUI] = useState<V4UIState>({
    mode: 'desktop',
    density: 'comfortable',
    railShown: false,
    chatW: 420,
    dmOpen: false,
    toolExpanded: false,
  });
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const portfolio = PORTFOLIOS[0];

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

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;

  const patchUI = (patch: Partial<V4UIState>) => setUI((prev) => ({ ...prev, ...patch }));

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

  return (
    <div className="app-v4 app-v4--desktop" data-density={ui.density} style={{ position: 'absolute', inset: 0 }}>
      <V4Shell
        ui={ui}
        tool={
          <V4Tool
            expanded={ui.toolExpanded}
            onToggle={() => patchUI({ toolExpanded: !ui.toolExpanded })}
          />
        }
        chat={
          <V4Chat
            portfolio={portfolio}
            onPortfolioChange={() => {
              /* auth shell is single-workspace; picker is cosmetic for now */
            }}
            messages={v4Messages}
            onSend={(text) => {
              if (!sending) onSend(text);
            }}
            isTyping={sending && !streamingText}
            width={ui.chatW}
            onWidthChange={(w) => patchUI({ chatW: w })}
            headerSlot={chatHeaderSlot}
          />
        }
        canvas={
          <V4Canvas
            tab={activeTab}
            portfolio={portfolio}
            onCloseTab={(id) => {
              setTabs((prev) => prev.filter((t) => t.id !== id));
              if (activeTabId === id) setActiveTabId(null);
            }}
            onOpenDeal={(d) => {
              const t: Tab = { id: `${d.id}-deal`, kind: 'deal', dealId: d.id, label: d.name, sub: d.kicker || d.stage };
              setTabs((prev) => (prev.some((x) => x.id === t.id) ? prev : [...prev, t]));
              setActiveTabId(t.id);
            }}
            onOpenModule={() => {
              /* module launcher — wire when tabs are real artifacts */
            }}
          />
        }
        rail={
          <V4Rail
            tabs={tabs}
            activeTabId={activeTabId}
            expanded={ui.railShown}
            onSwitch={setActiveTabId}
            onClose={(id) => {
              setTabs((prev) => prev.filter((t) => t.id !== id));
              if (activeTabId === id) setActiveTabId(null);
            }}
            onReorder={(draggedId, overId) => {
              if (draggedId === overId) return;
              setTabs((prev) => {
                const next = [...prev];
                const from = next.findIndex((t) => t.id === draggedId);
                const to = next.findIndex((t) => t.id === overId);
                if (from < 0 || to < 0) return prev;
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                return next;
              });
            }}
            onCollapse={() => patchUI({ railShown: !ui.railShown })}
            onNewTab={() => {
              /* hook to new-tab launcher when we have one */
            }}
          />
        }
      />
    </div>
  );
}
