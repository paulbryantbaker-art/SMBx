/**
 * Canvas (mobile) — the home for anything Yulia opens "on the canvas".
 *
 * The atlasmobile shell routes `screen:"canvas"` here. Until now that folded to
 * the deal cockpit, so chat-opened analyses/models had nowhere to render and
 * Yulia's "I opened it on the canvas" was a dead end. This surface reads the
 * same registry/modelStore the desktop canvas uses (registerCanvasArtifact +
 * useModelStore), so the "Open on canvas" control in chat lands on real content:
 *
 *   • interactive model tab  → the shared ModelRenderer
 *   • long-form artifact     → readable `.atlas-md` markdown (mobile standard)
 *   • nothing on the canvas  → fall back to the deal cockpit (prior behavior)
 *
 * Body-flow layout (no nested scroller) so the shell's `.scr` owns scrolling and
 * iOS keeps collapsing its chrome (see [[mobile-scroll-architecture]]).
 */
import { useMemo } from "react";
import Markdown from "react-markdown";
import { useModelStore } from "../../../../lib/modelStore";
import { getCanvasArtifact } from "../../desktop/screens/Canvas";
import ModelRenderer from "../../../models/ModelRenderer";
import CockpitMobileScreen from "./Cockpit";
import { useAtlasChat, useAtlasNav, type AtlasScreenProps } from "../../desktop/atlasNav";
import { useMobileShell } from "../mobileShell";
import { Toolbar } from "../iosKit";
import { T } from "../../desktop/atlasTokens";
import { RT } from "../redesign/rt";
import type { CSSProperties } from "react";

export default function CanvasMobileScreen({ user, view }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const shell = useMobileShell();
  const canvasTabId = view.canvasTabId;

  // Live model tab (the store is the source of truth; subscribe so Yulia's
  // update_model re-renders here).
  const modelTab = useModelStore((s) => (canvasTabId ? s.tabs[canvasTabId] : undefined));
  // Otherwise a stashed analysis/content artifact (registry is populated
  // synchronously before navigation).
  const artifact = useMemo(() => getCanvasArtifact(canvasTabId), [canvasTabId]);

  const talkToYulia = (prompt: string) => chat?.send(prompt);

  // Contextual bottom toolbar (iOS UIToolbar): step back to the deal, or hand
  // the open artifact to Yulia to revise. Pinned; content clears it via padding.
  const canvasToolbar = (
    <div style={S.toolbarBar}>
      <Toolbar
        leading={{
          label: "Back to deal",
          onClick: () =>
            view.dealId != null ? nav.openDeal(view.dealId, view.dealName) : nav.go("deals"),
        }}
        trailing={{ label: "Ask Yulia", primary: true, onClick: () => shell?.openChat() }}
      />
    </div>
  );

  // Interactive model → the shared renderer.
  if (canvasTabId && modelTab) {
    return (
      <>
        <div style={S.wrap}>
          <h1 style={S.title}>{modelTab.title || "Interactive model"}</h1>
          <ModelRenderer tabId={canvasTabId} onTalkToYulia={talkToYulia} />
        </div>
        {canvasToolbar}
      </>
    );
  }

  // Long-form analysis / content → readable markdown.
  if (artifact) {
    return (
      <>
        <div style={S.wrap}>
          <h1 style={S.title}>{artifact.title}</h1>
          {artifact.markdown ? (
            <div className="atlas-md" style={S.body}>
              <Markdown>{artifact.markdown}</Markdown>
            </div>
          ) : (
            <div style={S.emptyCard}>
              <div style={S.emptyTitle}>Nothing to show yet</div>
              <div style={S.emptyHint}>Ask Yulia to open or rerun this on the canvas.</div>
              <button
                type="button"
                style={S.emptyBtn}
                onClick={() => talkToYulia(`Reopen ${artifact.title} on the canvas with the latest data.`)}
              >
                Ask Yulia
              </button>
            </div>
          )}
        </div>
        {canvasToolbar}
      </>
    );
  }

  // Nothing on the canvas (e.g. opened with only a deal in context) → the deal
  // cockpit, which is what the canvas screen folded to before.
  return <CockpitMobileScreen user={user} view={view} />;
}

const S: Record<string, CSSProperties> = {
  // Bottom padding clears the pinned toolbar so the last content isn't hidden.
  wrap: { padding: "16px 18px 96px" },
  // Pinned contextual toolbar — a small bottom-anchored fixed bar (Safari rule:
  // NOT a full-viewport fixed bg div; the Toolbar itself carries the material).
  toolbarBar: { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 6 },
  title: {
    margin: "0 0 12px",
    fontSize: 21,
    fontWeight: 800,
    color: RT.ink,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  body: { color: RT.ink },
  emptyCard: {
    background: RT.card,
    borderRadius: 16,
    padding: 18,
  },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: RT.ink },
  emptyHint: { marginTop: 6, fontSize: 14, lineHeight: 1.5, color: RT.muted },
  emptyBtn: {
    marginTop: 14,
    border: "none",
    borderRadius: T.rPill,
    background: RT.accent,
    color: RT.onAccent,
    fontSize: 14,
    fontWeight: 700,
    padding: "10px 18px",
    cursor: "pointer",
    fontFamily: T.font,
  },
};
