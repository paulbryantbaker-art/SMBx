/* V6 Mobile — Yulia avatar mark (square rounded, App Store icon style).
   Linear gradient (155deg) over each verdict tint + soft white inner edge. */

import type { YIconKind } from "./types";

interface YIconProps {
  size?: number;
  kind?: YIconKind;
  radius?: number;
}

const GRADIENTS: Record<YIconKind, [string, string]> = {
  default: ["#A8D4BD", "#5FA88A"],
  pursue:  ["#A8D4BD", "#5FA88A"],
  watch:   ["#EBC891", "#C99959"],
  pass:    ["#EBB1AA", "#C6857D"],
  cool:    ["#A9C4E5", "#7FA8D9"],
};

export function YIcon({ size = 60, kind = "default", radius }: YIconProps) {
  const r = radius ?? size * 0.225;
  const [c1, c2] = GRADIENTS[kind] ?? GRADIENTS.default;
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: `linear-gradient(155deg, ${c1} 0%, ${c2} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "var(--mb-font-display)",
        fontWeight: 700,
        fontSize: size * 0.5,
        letterSpacing: -1,
        boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >Y</div>
  );
}
