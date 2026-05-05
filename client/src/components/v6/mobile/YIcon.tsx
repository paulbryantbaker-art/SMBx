/* V6 Mobile — Yulia avatar mark (square rounded, App Store icon style).
   Three-layer recipe to get the depth-and-pop feel of a real iOS app
   icon instead of a flat tinted square:
     1. Stronger gradient — wider lightness gap between stops so the
        icon reads as lit-from-above instead of a uniform color block.
     2. Inner top highlight — soft 30% white sheen on the upper edge.
     3. Outer 0.5px hairline + tight 1px shadow — defines the icon
        crisply against any backdrop (white card, periwinkle gradient,
        gold marble) without the heavy drop-shadow look. */

import type { YIconKind } from "./types";

interface YIconProps {
  size?: number;
  kind?: YIconKind;
  radius?: number;
}

/* Gradient stops: [light top, deep bottom]. The deep stop is the same
   hue family but ~25% darker, giving the icon depth without changing
   its identity color. Saturation on the deep stop is intentionally
   higher so the icon reads vivid even at 48px. */
const GRADIENTS: Record<YIconKind, [string, string]> = {
  default: ["#B5DCC5", "#3F8A6A"],
  pursue:  ["#B5DCC5", "#3F8A6A"],
  watch:   ["#F0CF98", "#B8853F"],
  pass:    ["#F0BAB3", "#A85248"],
  cool:    ["#B6CDEB", "#5689C8"],
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
        // 145deg gives a softer "lit from upper-left" angle than 155.
        // Top color sits in the upper-left quadrant and the deep stop
        // wraps around the lower-right, like real iOS icons.
        background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "var(--mb-font-display)",
        fontWeight: 700,
        fontSize: size * 0.5,
        letterSpacing: -1,
        boxShadow: [
          // Outer hairline — defines the icon edge against any backdrop.
          "0 0 0 0.5px rgba(0,0,0,0.06)",
          // Tight near shadow grounds the icon to the surface.
          "0 1px 2px rgba(0,0,0,0.10)",
          // Inner top highlight — sells the "lit from above" angle.
          "inset 0 1px 0 rgba(255,255,255,0.32)",
          // Inner 0.5px white edge — crisp definition along the rim.
          "inset 0 0 0 0.5px rgba(255,255,255,0.14)",
        ].join(","),
        // Subtle text shadow on the Y for legibility on lighter tints.
        textShadow: "0 1px 0 rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >Y</div>
  );
}
