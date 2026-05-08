export type MobileTab = "today" | "pipeline" | "search" | "brief";

export type MobileViewKind =
  | "tab"
  | "detail"
  | "watching"
  | "search"
  | "library"
  | "library-finder"
  | "library-detail"
  | "library-doc";

export interface MobileView {
  kind: MobileViewKind;
  tab?: MobileTab;
  dealId?: string;
  dealTitle?: string;
  dealMeta?: string;
  portfolioName?: string;
  dealStage?: string;
  docTitle?: string;
  docMeta?: string;
  docKind?: string;
  filesFilter?: string;
}

export interface MobileMessage {
  who: "u" | "y";
  text: string;
}

export interface MobileChatBridge {
  thread: MobileMessage[];
  sending: boolean;
  streamingText: string;
  activeTool: string | null;
  error: string | null;
  send: (text: string) => void;
}

export type Verdict = "pursue" | "watch" | "pass";
export type YIconKind = Verdict | "default" | "cool";

export type IconName =
  | "chat" | "search" | "back" | "share" | "close" | "download"
  | "chevron" | "star" | "arrowUp"
  | "today" | "pipeline" | "brief";

export type GlassTint = "light" | "chrome" | "dark" | "onColor";
