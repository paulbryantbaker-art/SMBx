import type { SurfaceContext } from "../../../lib/yuliaSurfaceContext";

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
  | "analysis";

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
  analysisTitle?: string;
  analysisTool?: string;
  analysisRunId?: number | null;
  analysisData?: Record<string, any>;
  analysisMarkdown?: string;
  comparisonData?: Record<string, any>[];
  versionNumber?: number | null;
  status?: string;
  modelState?: Record<string, any>;
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
  send: (text: string, surfaceContext?: SurfaceContext) => void;
}

export type Verdict = "pursue" | "watch" | "pass";
export type YIconKind = Verdict | "default" | "cool";

export type IconName =
  | "chat" | "search" | "back" | "share" | "close" | "download"
  | "chevron" | "star" | "arrowUp"
  | "today" | "pipeline" | "brief";

export type GlassTint = "light" | "chrome" | "dark" | "onColor";
