/**
 * Canvas rehydration — restore a conversation's SERVER-persisted canvas tabs
 * (the `canvas_tabs` table, written by Yulia's tools) back into the client stores
 * so the deal's "On the canvas" analyses survive a reload, and Yulia never has to
 * redo work she already did. See [[yulia-deal-persistence]].
 *
 * Mapping (server canvas_tabs → client):
 *   type "model"    → useModelStore.restoreTab(modelType, initialAssumptions)
 *   type "markdown" → registerCanvasArtifact({ markdown: props.content })
 * Other tab kinds (sourcing/pipeline/deliverable/…) are desktop-canvas surfaces
 * the mobile Canvas screen doesn't render, so we skip them here.
 */
import { authHeaders } from "../hooks/useAuth";
import { useModelStore, type ModelType } from "./modelStore";
import { registerCanvasArtifact } from "../components/v6/desktop/screens/Canvas";

interface ServerCanvasTab {
  tab_id: string;
  type: string;
  label: string | null;
  props: Record<string, any> | null;
}

/** Fired whenever the canvas registry/store changes, so surfaces (e.g. the
 *  cockpit's "On the canvas" section) that read the non-reactive artifact
 *  registry can recompute. */
export const CANVAS_CHANGED_EVENT = "atlas:canvas-changed";
export function notifyCanvasChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CANVAS_CHANGED_EVENT));
}

export async function rehydrateCanvasTabs(conversationId: number, dealId?: number | null): Promise<void> {
  try {
    const res = await fetch(`/api/chat/conversations/${conversationId}/canvas-tabs`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    const tabs: ServerCanvasTab[] = Array.isArray(data?.tabs) ? data.tabs : [];
    let restored = false;
    for (const t of tabs) {
      if (t.type === "model" && t.props?.modelType) {
        useModelStore
          .getState()
          .restoreTab(t.tab_id, t.props.modelType as ModelType, t.label || "Model", t.props.initialAssumptions ?? {}, dealId ?? undefined);
        restored = true;
      } else if (t.type === "markdown") {
        registerCanvasArtifact({ id: t.tab_id, kind: "analysis", title: t.label || "Analysis", markdown: t.props?.content ?? "", dealId: dealId ?? null });
        restored = true;
      }
    }
    if (restored) notifyCanvasChanged();
  } catch {
    /* offline / unauthenticated — leave the in-memory state as-is */
  }
}
