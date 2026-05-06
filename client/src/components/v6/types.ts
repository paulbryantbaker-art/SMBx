export type ModeId = "search" | "docs" | "analysis" | "intel" | "library";

export type TabKind =
  | "mode-root"
  | "deal"
  | "doc"
  | "analysis"
  | "learn"
  | "feed-item"
  | "settings"
  | "history"
  | "starter"
  | "model"
  | "sourcing"
  | "deliverable";

export type IconName =
  | "search" | "doc" | "chart" | "feed" | "library"
  | "settings" | "history" | "plus" | "close" | "pin" | "back" | "deal";

export interface Tab {
  id: string;
  kind: TabKind;
  modeId?: ModeId;
  title: string;
  pinned?: boolean;
  section?: "how" | "pricing";
  /** Optional element id inside the rendered tab to scroll into view. */
  anchor?: string;
  template?: string;
  tool?: string;
  /** kind: "model" — which interactive model to render (valuation, lbo, sba, etc.) */
  modelType?: string;
  /** kind: "model" — initial assumptions piped from the agentic tool call */
  initialAssumptions?: Record<string, unknown>;
  /** kind: "sourcing" — sourcing pipeline run id */
  runId?: string;
  /** kind: "deliverable" — deliverable record id */
  deliverableId?: string;
}

export interface GateAdvanceMeta {
  kind: "gate_advance";
  fromGate: string;
  toGate: string;
  gateName?: string;
  /** Optional completion-deliverable info from the SSE payload */
  completionDeliverableId?: number;
  completionDeliverableType?: string;
  completionDeliverableTitle?: string;
  completionDeliverableStatus?: "generating" | "complete" | "failed";
}

export interface Message {
  who: "u" | "y" | "system";
  text: string;
  /** Structured payload for system cards (e.g., gate-advance receipts). */
  meta?: GateAdvanceMeta;
}

export interface Mode {
  id: ModeId;
  label: string;
  count: string;
  icon: IconName;
}

export type OpenTab = (descriptor: Omit<Tab, "id"> & { id?: string }) => void;
