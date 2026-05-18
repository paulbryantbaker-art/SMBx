export type ModeId = "today" | "pipeline" | "search" | "studio" | "files" | "docs" | "analysis" | "intel" | "library";

export type TabKind =
  | "mode-root"
  | "files-list"
  | "deal"
  | "doc"
  | "analysis"
  | "learn"
  | "marketing-studio"
  | "feed-item"
  | "settings"
  | "history"
  | "starter";

export type StudioFormatId =
  | "buyer-pitch-book"
  | "seller-pitch-book"
  | "ic-deck"
  | "qoe-preview-book"
  | "cim-summary-deck"
  | "board-update"
  | "lender-book";
export type StudioView = "home" | "canvas" | "collection";

export type IconName =
  | "today" | "search" | "doc" | "chart" | "feed" | "library"
  | "settings" | "history" | "plus" | "close" | "pin" | "back" | "deal" | "studio";

export type FileScope = "all" | "data-room" | "shared";
export type FileListView = "all" | "deal-libraries" | "needs-action" | "data-rooms";

export interface Tab {
  id: string;
  kind: TabKind;
  modeId?: ModeId;
  sourceMode?: ModeId;
  title: string;
  dealId?: number | string | null;
  dealTitle?: string | null;
  pinned?: boolean;
  section?: "how" | "pricing";
  /** Optional element id inside the rendered tab to scroll into view. */
  anchor?: string;
  template?: string;
  tool?: string;
  markdown?: string;
  comparisonData?: Record<string, any>[];
  analysisData?: Record<string, any>;
  artifactData?: Record<string, any>;
  analysisRunId?: number | null;
  deliverableId?: number | null;
  modelState?: Record<string, any>;
  versionNumber?: number | null;
  resolvedMenuItemSlug?: string;
  status?: string;
  fileScope?: FileScope;
  fileListView?: FileListView;
  studioView?: StudioView;
  studioFormat?: StudioFormatId;
  studioDraftId?: string;
  studioBookId?: number | null;
  studioCampaign?: string;
  studioCollectionSub?: string;
  studioDirty?: boolean;
}

export interface StagedAction {
  id?: number | null;
  toolName: string;
  label: string;
  permissionLevel?: string;
  riskLevel?: string;
  writeScope?: string;
  summary: string;
  confirmEndpoint?: string | null;
  cancelEndpoint?: string | null;
}

export interface Message {
  who: "u" | "y";
  text: string;
  stagedAction?: StagedAction | null;
}

export interface Mode {
  id: ModeId;
  label: string;
  count: string;
  icon: IconName;
}

export type OpenTab = (descriptor: Omit<Tab, "id"> & { id?: string }) => void;
