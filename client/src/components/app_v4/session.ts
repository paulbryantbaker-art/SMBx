/**
 * Session state for v4.
 *
 * Three localStorage keys mirrored from `v4.jsx`:
 *   smbx-v4-state    — UI chrome (mode, density, rail, chat width, …)
 *   smbx-v4-session  — workspace (active portfolio, open tabs, active tab)
 *   smbx-v4-chats    — per-portfolio chat history
 *
 * Exposed as a React hook `useV4Session()`. Load lazily from localStorage,
 * auto-persist any change. No external state library — simple state in
 * a custom hook is enough for design-mode scope.
 */

import { useCallback, useEffect, useState } from 'react';
import { PORTFOLIOS, type ChatMessageSeed, type SpawnTabSpec } from './data';

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

export type V4Mode = 'desktop' | 'mobile';
export type V4Density = 'comfortable' | 'compact';

export interface V4UIState {
  mode: V4Mode;
  density: V4Density;
  railShown: boolean;
  chatW: number;        // px, 300–620
  dmOpen: boolean;      // deal messages dock expanded
  toolExpanded: boolean;
}

/** Every kind of content a tab can render. */
export type TabKind =
  | 'deal'
  | 'model'
  | 'loi'
  | 'compare'
  | 'doc'
  | 'rundown'
  | 'dd'
  | 'library'
  | 'portfolio'
  | 'scratch';

export interface Tab {
  id: string;
  kind: TabKind;
  dealId?: string;
  dealIds?: string[];
  label: string;
  sub?: string;
}

export interface V4Workspace {
  portfolioId: string;
  tabs: Tab[];
  activeTabId: string | null;
}

export interface ChatMessage extends ChatMessageSeed {
  progress?: string[];
  artifacts?: { label: string; sub?: string; icon?: string; _spec?: SpawnTabSpec }[];
}

export type ChatsByPortfolio = Record<string, ChatMessage[]>;

/* ═══════════════════════════════════════════════════════════════════
   Defaults
   ═══════════════════════════════════════════════════════════════════ */

const DEFAULT_UI: V4UIState = {
  mode: 'desktop',
  density: 'comfortable',
  railShown: true,
  chatW: 380,
  dmOpen: false,
  toolExpanded: false,
};

const DEFAULT_SESSION: V4Workspace = {
  portfolioId: 'fund1',
  tabs: [
    { id: 'atlas-deal',    kind: 'deal',    dealId: 'atlas',     label: 'Atlas Air',             sub: 'DD IN PROGRESS' },
    { id: 'atlas-model',   kind: 'model',   dealId: 'atlas',     label: 'Atlas · DCF',           sub: 'IRR 23.4%' },
    { id: 'benchmark-loi', kind: 'loi',     dealId: 'benchmark', label: 'Benchmark · LOI',       sub: 'DRAFTED' },
    { id: 'compare-3',     kind: 'compare', dealIds: ['atlas', 'summit', 'benchmark'], label: 'Atlas + Summit + Benchmark', sub: '3 DEALS' },
  ],
  activeTabId: 'atlas-deal',
};

/* ═══════════════════════════════════════════════════════════════════
   LocalStorage helpers
   ═══════════════════════════════════════════════════════════════════ */

const K_UI = 'smbx-v4-state';
const K_SESSION = 'smbx-v4-session';
const K_CHATS = 'smbx-v4-chats';

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode — ignore
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════════════════════════════ */

export interface V4Session {
  // UI chrome
  ui: V4UIState;
  setUI: (patch: Partial<V4UIState>) => void;

  // Workspace
  workspace: V4Workspace;
  openTab: (tab: Tab) => void;
  switchTab: (id: string) => void;
  closeTab: (id: string) => void;
  reorderTabs: (draggedId: string, overId: string) => void;
  changePortfolio: (portfolioId: string) => void;

  // Chat
  chats: ChatsByPortfolio;
  appendMessage: (portfolioId: string, msg: ChatMessage) => void;
  resetChat: (portfolioId: string) => void;
}

export function useV4Session(): V4Session {
  const [ui, setUIState] = useState<V4UIState>(() => load(K_UI, DEFAULT_UI));
  const [workspace, setWorkspace] = useState<V4Workspace>(() => load(K_SESSION, DEFAULT_SESSION));
  const [chats, setChats] = useState<ChatsByPortfolio>(() => load<ChatsByPortfolio>(K_CHATS, {}));

  /* persist on change */
  useEffect(() => save(K_UI, ui), [ui]);
  useEffect(() => save(K_SESSION, workspace), [workspace]);
  useEffect(() => save(K_CHATS, chats), [chats]);

  const setUI = useCallback((patch: Partial<V4UIState>) => {
    setUIState((prev) => ({ ...prev, ...patch }));
  }, []);

  const openTab = useCallback((tab: Tab) => {
    setWorkspace((prev) => {
      const exists = prev.tabs.some((t) => t.id === tab.id);
      const tabs = exists ? prev.tabs : [...prev.tabs, tab];
      return { ...prev, tabs, activeTabId: tab.id };
    });
  }, []);

  const switchTab = useCallback((id: string) => {
    setWorkspace((prev) => ({ ...prev, activeTabId: id }));
  }, []);

  const closeTab = useCallback((id: string) => {
    setWorkspace((prev) => {
      const idx = prev.tabs.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const tabs = prev.tabs.filter((t) => t.id !== id);
      let activeTabId = prev.activeTabId;
      if (activeTabId === id) {
        // focus neighbor (previous preferred, else next, else null)
        const neighbor = tabs[idx - 1] || tabs[idx] || null;
        activeTabId = neighbor ? neighbor.id : null;
      }
      return { ...prev, tabs, activeTabId };
    });
  }, []);

  const reorderTabs = useCallback((draggedId: string, overId: string) => {
    if (draggedId === overId) return;
    setWorkspace((prev) => {
      const tabs = [...prev.tabs];
      const from = tabs.findIndex((t) => t.id === draggedId);
      const to = tabs.findIndex((t) => t.id === overId);
      if (from < 0 || to < 0) return prev;
      const [moved] = tabs.splice(from, 1);
      tabs.splice(to, 0, moved);
      return { ...prev, tabs };
    });
  }, []);

  const changePortfolio = useCallback((portfolioId: string) => {
    setWorkspace((prev) => {
      const port = PORTFOLIOS.find((p) => p.id === portfolioId);
      if (!port) return prev;
      // Keep only tabs whose dealIds are valid in the new portfolio.
      const tabs = prev.tabs.filter((t) => {
        if (t.kind === 'portfolio' || t.kind === 'library' || t.kind === 'scratch') return true;
        if (t.dealIds) return t.dealIds.every((id) => port.dealIds.includes(id));
        if (t.dealId) return port.dealIds.includes(t.dealId);
        return true;
      });
      const activeTabId = tabs.some((t) => t.id === prev.activeTabId)
        ? prev.activeTabId
        : tabs[0]?.id ?? null;
      return { portfolioId, tabs, activeTabId };
    });
  }, []);

  const appendMessage = useCallback((portfolioId: string, msg: ChatMessage) => {
    setChats((prev) => ({
      ...prev,
      [portfolioId]: [...(prev[portfolioId] || []), msg],
    }));
  }, []);

  const resetChat = useCallback((portfolioId: string) => {
    setChats((prev) => ({ ...prev, [portfolioId]: [] }));
  }, []);

  return {
    ui,
    setUI,
    workspace,
    openTab,
    switchTab,
    closeTab,
    reorderTabs,
    changePortfolio,
    chats,
    appendMessage,
    resetChat,
  };
}
