import type { SurfaceContext } from "../../../lib/yuliaSurfaceContext";
import type { StagedAction, ToolTraceEntry } from "../types";

// Re-exported so mobile components can import everything chat-bridge-related
// from "./types" without reaching into the desktop v6 types module.
export type { StagedAction, ToolTraceEntry } from "../types";

export type MobileTab = "today" | "pipeline" | "search" | "brief";

export type MobileViewKind =
  | "tab"
  | "detail"
  | "watching"
  | "search"
  | "library"
  | "library-finder"
  | "library-detail"
  | "library-doc"
  | "analyses"
  | "analysis"
  | "deals-list"
  | "deal-team"
  | "provider-profile"
  | "model"
  | "usage";

export interface MobileView {
  kind: MobileViewKind;
  tab?: MobileTab;
  dealId?: string;
  /** Real numeric deal id, threaded into library-detail (data-room read path,
   *  GET /api/deals/:dealRawId/data-room) and deal-team (participants + deal
   *  messages, GET /api/deals/:dealRawId/participants|messages). Absent in the
   *  anon / sample context, which keeps the hardcoded sample experience and
   *  makes the deal-team view simply unreachable without a real deal. */
  dealRawId?: number;
  /** Real deliverable id, threaded into library-doc so the document reader
   *  can fetch GET /api/deliverables/:deliverableId. Absent → sample text. */
  deliverableId?: number;
  dealTitle?: string;
  dealMeta?: string;
  portfolioName?: string;
  dealStage?: string;
  docTitle?: string;
  docMeta?: string;
  docKind?: string;
  filesFilter?: string;
  analysisTitle?: string;
  analysisTool?: string;
  analysisRunId?: number | null;
  analysisData?: Record<string, any>;
  analysisMarkdown?: string;
  comparisonData?: Record<string, any>[];
  versionNumber?: number | null;
  status?: string;
  modelState?: Record<string, any>;
  /** Model lineage from create_model_tab (links a model back to the analysis
   *  run that spawned it). Carried on the view so later phases can save /
   *  re-run against the correct parent output. */
  parentOutputHash?: string | null;
  /** Live zustand modelStore tab id — set for kind 'model' (the real model
   *  canvas). The store, not the view, is the source of truth for model
   *  state; the view only carries the pointer (hash param `mtab`). */
  modelTabId?: string;
  /** Display title for kind 'model' (hash param `t`). */
  title?: string;
}

export interface MobileMessage {
  who: "u" | "y";
  text: string;
  /** Governed-write approval card attached to this message (authed chat only).
   *  THE LINE: descriptive — the user confirms or cancels; nothing auto-runs. */
  stagedAction?: StagedAction | null;
}

/** Plan-gate payload parsed by useAuthChat from the chat SSE `type:'paywall'`
 *  event. The hook stores the whole parsed event, so every field is optional —
 *  read defensively. `checkoutUrl` (when present) is a Stripe checkout link;
 *  otherwise route the user to /pricing. */
export interface MobilePaywallData {
  requiredPlan?: string;
  currentPlan?: string;
  priceDisplay?: string;
  message?: string;
  callToAction?: string;
  checkoutUrl?: string | null;
  valueProps?: string[];
  [key: string]: any;
}

export interface MobileChatBridge {
  thread: MobileMessage[];
  sending: boolean;
  streamingText: string;
  activeTool: string | null;
  /** Real tool calls from SSE tool_start/tool_done events — never synthesized.
   *  Empty array for the anonymous bridge. */
  toolTrace: ToolTraceEntry[];
  error: string | null;
  /** Set when the server gates a deliverable behind a plan. Null/undefined
   *  when there is nothing to upsell. */
  paywallData?: MobilePaywallData | null;
  send: (text: string, surfaceContext?: SurfaceContext) => void;
  /** Authed only — uploads into the active conversation. Undefined for anon
   *  (the composer shows a disabled affordance). */
  uploadFile?: (file: File) => Promise<{ name: string; size: string } | null>;
  confirmStagedAction?: (id: number, summary?: string) => void | Promise<void>;
  cancelStagedAction?: (id: number) => void | Promise<void>;
}

export type Verdict = "pursue" | "watch" | "pass";
export type YIconKind = Verdict | "default" | "cool";

export type IconName =
  | "chat" | "search" | "back" | "share" | "close" | "download"
  | "chevron" | "star" | "arrowUp" | "bell" | "bellOff"
  | "today" | "pipeline" | "brief";

export type GlassTint = "light" | "chrome" | "dark" | "onColor";
