/* EmptyState.tsx — V6EmptyState, the shared workspace empty-state card
 * (desktop⇄mobile fusion, Wave C2 — "texture as ornament object").
 *
 * One rested-elevation card (radius 18, --wk-elev-card) holding a 64×64
 * watercolor CHIP, a title, one short body line, and at most ONE action.
 *
 * TEXTURE EXEMPTION (write-once rule): work surfaces never take texture
 * FIELDS — the only texture allowed on them is this chip, because it is an
 * ornament OBJECT inside a card (≤64px, aria-hidden, overflow hidden), not
 * a field. It is therefore exempt from the one-texture-per-page rule.
 * Tint + texture always come from shared/verdictMaterial.ts — never
 * hardcode filenames or overlay gradients here. Pass `kind` only when a
 * real verdict exists; the default is the calm navy baseline wash.
 *
 * Expects to render inside a `.wk-content` subtree (the .wkbtn action and
 * .wk-tap press physics are scoped there). Reduced-motion safe: the only
 * motion is .wk-tap, which workspace.css already disables under
 * prefers-reduced-motion.
 */

import type { CSSProperties } from "react";
import { VERDICT_MATERIAL, type VerdictKind } from "./verdictMaterial";

export interface V6EmptyStateAction {
  label: string;
  onClick: () => void;
}

export function V6EmptyState({
  title,
  body,
  action,
  kind = "baseline",
}: {
  title: string;
  body: string;
  action?: V6EmptyStateAction;
  kind?: VerdictKind;
}) {
  const material = VERDICT_MATERIAL[kind];
  return (
    <div style={E.card}>
      <div
        aria-hidden
        style={{
          ...E.chip,
          backgroundImage: `${material.overlay}, url("${material.texture}")`,
        }}
      />
      <h2 style={E.title}>{title}</h2>
      <p style={E.body}>{body}</p>
      {action && (
        <button
          className="wkbtn dark wk-tap"
          type="button"
          onClick={action.onClick}
          style={E.action}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

const E: Record<string, CSSProperties> = {
  card: {
    maxWidth: 560,
    boxSizing: "border-box",
    padding: 28,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 18,
    boxShadow: "var(--wk-elev-card)",
    /* self-contained type: never inherit a host surface's serif (e.g. the
       doc sheet's Iowan Old Style) */
    fontFamily: "var(--font-body)",
  },
  /* The ornament object — texture clipped to a small chip, never a field. */
  chip: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.24), 0 6px 16px -8px rgba(20,28,44,0.30)",
  },
  title: {
    margin: "16px 0 0",
    fontSize: 15,
    fontWeight: 650,
    letterSpacing: "-0.01em",
    lineHeight: 1.3,
    color: "var(--ink)",
  },
  body: {
    margin: "6px 0 0",
    fontSize: 13.5,
    lineHeight: 1.5,
    color: "var(--ink-2)",
    textWrap: "pretty",
  },
  action: {
    marginTop: 16,
  },
};
