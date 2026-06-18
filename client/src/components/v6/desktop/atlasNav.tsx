/**
 * Atlas navigation model. AtlasApp owns a single `useState<AtlasView>` and
 * provides this context; every screen reads `useAtlasNav()` to move around.
 * There is no wouter routing inside Atlas — the active screen lives in this
 * view object (mirrors how V6Mobile holds its own `view` state).
 *
 * The chat bridge is provided through a SECOND context (AtlasChatContext) so
 * the rail and any screen that prefills Yulia can reach it.
 */
import { createContext, useContext } from "react";
import type { MobileChatBridge } from "../mobile/types";
import type { User } from "../../../hooks/useAuth";

export type AtlasScreen =
  | "today"
  | "pipeline"
  | "sourcing"
  | "deals"
  | "studio"
  | "integration"
  | "files"
  | "agent"
  | "cockpit"
  | "canvas"
  | "settings";

export type SettingsPane =
  | "profile"
  | "billing"
  | "notifications"
  | "members"
  | "connections"
  | "security";

export interface AtlasView {
  screen: AtlasScreen;
  dealId?: number;
  dealName?: string;
  settingsPane?: SettingsPane;
  subId?: string;
  canvasTabId?: string;
}

export interface AtlasNav {
  view: AtlasView;
  go(screen: AtlasScreen, opts?: Partial<AtlasView>): void;
  /** Open a deal's cockpit. */
  openDeal(dealId: number, dealName?: string): void;
  /** Open settings (optionally a specific pane). */
  openSettings(pane?: SettingsPane): void;
  /** Open a chat-spawned canvas artifact (analysis/model tab). */
  openCanvas(canvasTabId: string, dealId?: number): void;
}

export const AtlasNavContext = createContext<AtlasNav | null>(null);

export function useAtlasNav(): AtlasNav {
  const nav = useContext(AtlasNavContext);
  if (!nav) {
    throw new Error("useAtlasNav must be used within an AtlasNavContext provider (AtlasApp).");
  }
  return nav;
}

/** The chat bridge context — the rail consumes it; screens may read it to
 *  prefill a Yulia message. Null when the bridge is not yet constructed. */
export const AtlasChatContext = createContext<MobileChatBridge | null>(null);

export function useAtlasChat(): MobileChatBridge | null {
  return useContext(AtlasChatContext);
}

/** Props contract every Atlas screen receives. Screens get nav via
 *  `useAtlasNav()` and the chat bridge via `useAtlasChat()`; data context comes
 *  off `view` (dealId / settingsPane / subId) plus the screen's own hooks. */
export interface AtlasScreenProps {
  user: User | null;
  view: AtlasView;
}
