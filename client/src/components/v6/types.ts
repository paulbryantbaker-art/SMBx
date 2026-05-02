export type ModeId = "search" | "docs" | "analysis" | "intel" | "library";

export type TabKind = "mode-root" | "deal" | "doc" | "analysis" | "learn" | "feed-item";

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
