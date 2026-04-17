/**
 * Shared types for the Glass Grok internal app.
 * See memory/architecture_glass_grok.md for the full design spec.
 */

import type { AnonMessage } from '../../hooks/useAnonymousChat';

/** The four primary routes in the post-morph app. */
export type AppTab = 'deal' | 'docs' | 'pipeline' | 'search';

/** Yulia's three states (Apple Music Now-Playing pattern). */
export type YuliaState = 'full' | 'mini' | 'side';

/** Status dot colors — the only UI color permitted. */
export type StatusKind = 'ready' | 'progress' | 'flag' | 'draft';

/** Conversation / chapter inside a deal. */
export interface AppConversation {
  id: number;
  title: string | null;
  summary?: string | null;
  gate_label?: string | null;
  gate_status?: string | null;
  updated_at?: string | null;
}

/** Deal — the primary entity in the app. Shape mirrors authChat.grouped.deals. */
export interface AppDeal {
  id: number;
  business_name: string | null;
  journey_type: string | null;   // 'sell' | 'buy' | 'raise' | 'pmi'
  current_gate: string | null;    // S0..S5, B0..B5, R0..R5, PMI0..PMI3
  industry: string | null;
  league?: string | null;
  updated_at: string | null;
  status?: string | null;
  conversations: AppConversation[];
}

/** What the shell needs to render. Passed by AppShell.tsx. */
export interface AppShellInnerProps {
  // User
  userName: string | null;
  userInitial: string;

  // Deal context
  deals: AppDeal[];
  activeDealId: number | null;
  activeConversationId: number | null;

  // Chat / Yulia state
  messages: AnonMessage[];
  streamingText: string;
  sending: boolean;
  activeTool?: string | null;

  // Handlers
  onSend: (text: string) => void;
  onSelectDeal: (dealId: number) => void;
  onOpenDeliverable?: (message: AnonMessage) => void;
  onAccountTap: () => void;
  onBack: () => void;  // exits the app shell (e.g. back to landing)
}

/** Deliverable / document summary for list rendering. */
export interface AppDocument {
  id: string;
  title: string;
  kind: string;           // 'CIM' | 'Baseline' | 'Add-back' etc.
  status: StatusKind;     // drives the status dot color
  updatedAt?: string;
  meta?: string;          // "v2 · 14 pages" etc.
}
