/**
 * CanvasScreen — renders chat-opened artifacts (interactive models + analysis
 * markdown) inside Atlas. This is FOUNDATION-owned: it reuses the SAME zustand
 * modelStore + ModelRenderer the mobile/desktop canvas already uses, so a model
 * Yulia opens in chat is the same living tab she reads back (update_model /
 * read_tab_state target the same tab id).
 *
 * AtlasApp routes `smbx:canvas_action` here:
 *   - create_model_tab → ensureModelTabFromCanvasAction → modelStore tab; the
 *     view carries `canvasTabId` (the model tab id) and we render ModelRenderer.
 *   - open_tab(analysis) / show_content → AtlasApp stashes the artifact in a
 *     module-level registry keyed by id; we render its markdown read-only.
 *
 * Honesty: no demo content. If there's no live model tab and no stashed
 * artifact, we show an honest empty state telling the user to ask Yulia.
 */
import { useEffect, useState } from "react";
import ModelRenderer from "../../../models/ModelRenderer";
import { useModelStore } from "../../../../lib/modelStore";
import { useAtlasChat, useAtlasNav, type AtlasScreenProps } from "../atlasNav";
import { EmptyState } from "../primitives";
import { T } from "../atlasTokens";

/** Lightweight artifact a chat `open_tab`/`show_content` produced. AtlasApp
 *  records these so Canvas can render long-form analysis markdown without a
 *  parallel fetch (the content already arrived over the chat SSE stream). */
export interface CanvasArtifact {
  id: string;
  kind: "analysis" | "content";
  title: string;
  markdown?: string;
  analysisRunId?: number | null;
  dealId?: number | null;
}

// Module-level registry shared with AtlasApp (same module graph). AtlasApp
// writes via registerCanvasArtifact; Canvas reads by id. Kept tiny and
// session-scoped — it is not a data source, just a handoff for content that
// already streamed through chat.
const ARTIFACTS = new Map<string, CanvasArtifact>();

export function registerCanvasArtifact(artifact: CanvasArtifact): void {
  ARTIFACTS.set(artifact.id, artifact);
}

export function getCanvasArtifact(id: string | undefined): CanvasArtifact | null {
  if (!id) return null;
  return ARTIFACTS.get(id) ?? null;
}

/** Long-form artifacts registered this session for a deal — lets a surface (e.g.
 *  the cockpit) list "what Yulia opened on the canvas" so the user can return to
 *  it instead of asking her to redo the work. */
export function listCanvasArtifacts(dealId?: number | null): CanvasArtifact[] {
  const all = [...ARTIFACTS.values()];
  return dealId == null ? all : all.filter((a) => a.dealId === dealId);
}

export default function CanvasScreen({ view }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const canvasTabId = view.canvasTabId;

  // A model tab? The store is the source of truth. Subscribe so updates
  // (update_model from Yulia) re-render live.
  const modelTab = useModelStore((s) => (canvasTabId ? s.tabs[canvasTabId] : undefined));

  // Otherwise it may be a stashed analysis/content artifact. Re-read on tab
  // change (the registry is populated synchronously by AtlasApp before nav).
  const [artifact, setArtifact] = useState<CanvasArtifact | null>(() => getCanvasArtifact(canvasTabId));
  useEffect(() => {
    setArtifact(getCanvasArtifact(canvasTabId));
  }, [canvasTabId]);

  const onTalkToYulia = (prompt: string) => {
    chat?.send(prompt);
  };

  if (modelTab) {
    return (
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <div style={{ padding: "18px 24px", flex: "none" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: "-.01em" }}>
            {modelTab.title || "Interactive model"}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "8px 0 40px" }}>
          <ModelRenderer tabId={canvasTabId!} onTalkToYulia={onTalkToYulia} />
        </div>
      </div>
    );
  }

  if (artifact) {
    return (
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <div style={{ padding: "18px 24px", flex: "none" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: "-.01em" }}>{artifact.title}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "24px 32px 56px" }}>
          {artifact.markdown ? (
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: T.font,
                fontSize: 14,
                lineHeight: 1.6,
                color: T.ink3,
                maxWidth: 760,
              }}
            >
              {artifact.markdown}
            </pre>
          ) : (
            <EmptyState
              title="Nothing to show yet"
              hint="Ask Yulia to open or rerun this on the canvas."
              cta="Ask Yulia"
              onCta={() => onTalkToYulia(`Reopen ${artifact.title} on the canvas with the latest data.`)}
            />
          )}
        </div>
      </div>
    );
  }

  // No live model, no stashed artifact — honest empty. The canvas opens when
  // Yulia fires a tool result; nudge the user back to a working surface.
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <EmptyState
        title="Nothing open on the canvas"
        hint="Ask Yulia to run an analysis or open a model and it will appear here."
        cta="Go to Deals"
        onCta={() => nav.go("deals")}
      />
    </div>
  );
}
