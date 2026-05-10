export type ModeId = "today" | "pipeline" | "search" | "files" | "docs" | "analysis" | "intel" | "library";

export type TabKind =
  | "mode-root"
  | "files-list"
  | "deal"
  | "doc"
  | "analysis"
  | "learn"
  | "feed-item"
  | "settings"
  | "history"
  | "starter";

export type IconName =
  | "today" | "search" | "doc" | "chart" | "feed" | "library"
  | "settings" | "history" | "plus" | "close" | "pin" | "back" | "deal";

export type FileScope = "all" | "data-room" | "shared";
export type FileListView = "all" | "deal-libraries" | "needs-action" | "data-rooms";

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
  fileScope?: FileScope;
  fileListView?: FileListView;
}

export interface Message {
  who: "u" | "y";
  text: string;
}

export interface Mode {
  id: ModeId;
  label: string;
  count: string;
  icon: IconName;
}

export type OpenTab = (descriptor: Omit<Tab, "id"> & { id?: string }) => void;
