/**
 * Canvas (mobile) — the home for anything Yulia opens "on the canvas".
 *
 * The atlasmobile shell routes `screen:"canvas"` here:
 *   • interactive model tab  → the shared ModelRenderer
 *   • long-form artifact     → readable `.atlas-md` markdown (mobile standard)
 *   • nothing on the canvas  → fall back to the deal cockpit (prior behavior)
 *
 * Body-flow layout (no nested scroller) so the shell's `.scr` owns scrolling and
 * iOS keeps collapsing its chrome (see [[mobile-scroll-architecture]]).
 *
 * New-UI action bar (warm/green): "Back to deal" (neutral) + "Ask Yulia" (green
 * pill — the primary action: revise the open artifact). The shell hides the FAB
 * on canvas so Yulia isn't doubled.
 */
import { useMemo } from "react";
import Markdown from "react-markdown";
import { useModelStore } from "../../../../lib/modelStore";
import { getCanvasArtifact } from "../../desktop/screens/Canvas";
import ModelRenderer from "../../../models/ModelRenderer";
import CockpitMobileScreen from "./Cockpit";
import { useAtlasChat, useAtlasNav, type AtlasScreenProps } from "../../desktop/atlasNav";
import { useMobileShell } from "../mobileShell";
import { BackIcon } from "../../desktop/icons";
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
  // Otherwise a stashed analysis/content artifact.
  const artifact = useMemo(() => getCanvasArtifact(canvasTabId), [canvasTabId]);

  const talkToYulia = (prompt: string) => chat?.send(prompt);
  const backToDeal = () => (view.dealId != null ? nav.openDeal(view.dealId, view.dealName) : nav.go("deals"));

  // New-UI action bar — pinned; content clears it via wrap padding.
  const menuBar = (
    <div style={S.menuBar}>
      <button type="button" style={S.backBtn} onClick={backToDeal}>
        <BackIcon size={20} c={RT.ink2} />
        Back to deal
      </button>
      <button type="button" style={S.askBtn} onClick={() => shell?.openChat()}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill={RT.onAccent} aria-hidden="true">
          <path d="M12 2c.4 4.6 2.4 6.6 7 7-4.6.4-6.6 2.4-7 7-.4-4.6-2.4-6.6-7-7 4.6-.4 6.6-2.4 7-7z" />
        </svg>
        Ask Yulia
      </button>
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
        {menuBar}
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
        {menuBar}
      </>
    );
  }

  // Nothing on the canvas → the deal cockpit (prior fallback).
  return <CockpitMobileScreen user={user} view={view} />;
}

const S: Record<string, CSSProperties> = {
  // Bottom padding clears the pinned action bar so the last content isn't hidden.
  wrap: { padding: "14px 18px 104px" },
  title: {
    margin: "2px 0 16px",
    fontSize: 24,
    fontWeight: 700,
    color: RT.ink,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  body: { color: RT.ink },
  // Pinned action bar — a clean white bar with a warm hairline (NOT a glass
  // strip). Small bottom-anchored fixed element (Safari rule).
  menuBar: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 10px)",
    background: RT.card,
    borderTop: "1px solid rgba(25,24,19,.08)",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    background: "transparent",
    border: "none",
    padding: "8px 4px",
    marginLeft: -4,
    fontSize: 15.5,
    fontWeight: 600,
    color: RT.ink2,
    cursor: "pointer",
    fontFamily: RT.font,
    WebkitTapHighlightColor: "transparent",
  },
  askBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: RT.accent,
    color: RT.onAccent,
    border: "none",
    borderRadius: RT.rPill,
    padding: "11px 19px",
    fontSize: 15.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: RT.font,
    WebkitTapHighlightColor: "transparent",
  },
  emptyCard: { background: RT.card, borderRadius: RT.rCard, padding: 18 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: RT.ink },
  emptyHint: { marginTop: 6, fontSize: 14, lineHeight: 1.5, color: RT.muted },
  emptyBtn: {
    marginTop: 14,
    border: "none",
    borderRadius: RT.rPill,
    background: RT.accent,
    color: RT.onAccent,
    fontSize: 14,
    fontWeight: 700,
    padding: "10px 18px",
    cursor: "pointer",
    fontFamily: RT.font,
  },
};
