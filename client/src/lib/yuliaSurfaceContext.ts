import type { MobileTab, MobileView } from "../components/v6/mobile/types";
import type { FileScope, ModeId, Tab } from "../components/v6/types";

export interface SurfaceContext {
  device: "desktop" | "mobile";
  activeMode?: string;
  activeView?: string;
  activeTabId?: string;
  activeTabKind?: string;
  activeTitle?: string;
  dealId?: string | number;
  dealTitle?: string;
  dealStage?: string;
  portfolioName?: string;
  fileScope?: string;
  filesFilter?: string;
  documentTitle?: string;
  documentMeta?: string;
  documentKind?: string;
  analysisRunId?: number;
  canvasVersion?: number;
  modelStateSummary?: string;
}

export function buildDesktopSurfaceContext(
  activeMode: ModeId,
  activeTabId: string,
  tabs: Tab[],
): SurfaceContext {
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const fileScope = activeTab?.fileScope;
  const filesFilter = activeTab?.kind === "files-list" ? activeTab.fileListView : undefined;

  return compactSurfaceContext({
    device: "desktop",
    activeMode,
    activeView: activeTab?.kind ?? "mode-root",
    activeTabId,
    activeTabKind: activeTab?.kind,
    activeTitle: activeTab?.title,
    dealId: activeTab?.kind === "deal" ? activeTab.id : undefined,
    dealTitle: activeTab?.kind === "deal" ? activeTab.title : undefined,
    fileScope,
    filesFilter,
    analysisRunId: activeTab?.analysisRunId ?? undefined,
    canvasVersion: activeTab?.versionNumber ?? undefined,
    modelStateSummary: summarizeModelState(activeTab?.modelState, activeTab?.analysisData),
  });
}

export function buildMobileSurfaceContext(
  view: MobileView,
  activeTab: MobileTab,
): SurfaceContext {
  return compactSurfaceContext({
    device: "mobile",
    activeMode: activeTab,
    activeView: view.kind,
    activeTabId: view.kind === "tab" ? `${activeTab}-root` : view.kind,
    activeTabKind: view.kind,
    activeTitle: mobileTitleForView(view, activeTab),
    dealId: view.dealId,
    dealTitle: view.dealTitle,
    dealStage: view.dealStage,
    portfolioName: view.portfolioName,
    fileScope: normalizeMobileFileScope(view.dealStage),
    filesFilter: view.filesFilter,
    documentTitle: view.docTitle,
    documentMeta: view.docMeta,
    documentKind: view.docKind,
    analysisRunId: view.kind === "analysis" ? view.analysisRunId ?? undefined : undefined,
    canvasVersion: view.kind === "analysis" ? view.versionNumber ?? undefined : undefined,
    modelStateSummary: view.kind === "analysis" ? summarizeModelState(view.modelState, view.analysisData) : undefined,
  });
}

function mobileTitleForView(view: MobileView, activeTab: MobileTab): string {
  if (view.kind === "tab") return titleCase(view.tab ?? activeTab);
  if (view.kind === "detail") return view.dealTitle ?? "Deal";
  if (view.kind === "library-detail") return view.dealTitle ?? "Deal files";
  if (view.kind === "library-doc") return view.docTitle ?? "Document";
  if (view.kind === "analysis") return view.analysisTitle ?? "Analysis";
  if (view.kind === "library-finder") return "Files";
  if (view.kind === "library") return "Files";
  if (view.kind === "search") return "Search";
  if (view.kind === "watching") return "Watching";
  return titleCase(activeTab);
}

function normalizeMobileFileScope(stage?: string): FileScope | undefined {
  if (stage === "all" || stage === "data-room" || stage === "shared") return stage;
  return undefined;
}

function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function compactSurfaceContext(context: SurfaceContext): SurfaceContext {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined && value !== ""),
  ) as SurfaceContext;
}

function summarizeModelState(modelState?: Record<string, unknown>, analysisData?: Record<string, unknown>): string | undefined {
  const summary: Record<string, unknown> = {};
  if (modelState && Object.keys(modelState).length > 0) {
    summary.state = modelState;
  }
  if (analysisData?.schemaVersion === "analysis-runtime-v1") {
    const structured = analysisData as Record<string, any>;
    summary.analysisType = structured.analysisType;
    summary.verdict = structured.verdict?.label;
    summary.score = structured.verdict?.score;
    summary.assumptions = Array.isArray(structured.assumptions)
      ? structured.assumptions.slice(0, 8).map((item: Record<string, unknown>) => ({
          key: item.key,
          label: item.label,
          value: item.displayValue,
        }))
      : undefined;
    summary.keyMetrics = Array.isArray(structured.metrics)
      ? structured.metrics.slice(0, 8).map((item: Record<string, unknown>) => ({
          key: item.key,
          label: item.label,
          value: item.displayValue,
        }))
      : undefined;
    summary.evidence = Array.isArray(structured.evidenceRefs)
      ? structured.evidenceRefs.slice(0, 6).map((item: Record<string, unknown>) => ({
          label: item.label,
          source: item.source,
          confidence: item.confidence,
        }))
      : undefined;
    summary.yuliaRead = typeof structured.yuliaRead === "string"
      ? structured.yuliaRead.slice(0, 360)
      : undefined;
  }
  return Object.keys(summary).length > 0 ? JSON.stringify(summary).slice(0, 1800) : undefined;
}
