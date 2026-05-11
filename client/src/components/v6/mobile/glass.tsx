/* V6 Mobile — Liquid Glass v2 surface primitive (iOS 26 spec).
   Multi-layer: bg tint + thick backdrop-filter + 0.5px white inner edge + soft shadow.
   Source recipes: design_handoff_smbx_app store/glass-primitives.jsx */

import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import type { GlassTint } from "./types";

interface TintRecipe {
  bg: string;
  filter: string;
  edge: string;
  shadow: string;
}

const TINTS: Record<GlassTint, TintRecipe> = {
  light: {
    bg: "rgba(255,255,255,0.55)",
    filter: "blur(32px) saturate(180%) brightness(1.05)",
    edge: "inset 0 0 0 0.5px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.55)",
    shadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -6px rgba(0,0,0,0.10)",
  },
  chrome: {
    bg: "rgba(255,255,255,0.62)",
    filter: "blur(40px) saturate(180%) brightness(1.06)",
    edge: "inset 0 0 0 0.5px rgba(255,255,255,0.75), inset 0 1px 0 rgba(255,255,255,0.55)",
    shadow: "0 1px 0 rgba(0,0,0,0.04), 0 10px 30px -8px rgba(0,0,0,0.14)",
  },
  dark: {
    bg: "rgba(28,28,32,0.62)",
    filter: "blur(40px) saturate(180%) brightness(0.92)",
    edge: "inset 0 0 0 0.5px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
    shadow: "0 1px 3px rgba(0,0,0,0.20), 0 10px 28px -8px rgba(0,0,0,0.40)",
  },
  onColor: {
    bg: "rgba(255,255,255,0.18)",
    filter: "blur(20px) saturate(180%) brightness(1.10)",
    edge: "inset 0 0 0 0.5px rgba(255,255,255,0.32), inset 0 1px 0 rgba(255,255,255,0.22)",
    shadow: "0 1px 2px rgba(0,0,0,0.06)",
  },
};

interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  radius?: number | string;
  tint?: GlassTint;
  style?: CSSProperties;
  className?: string;
}

export function GlassSurface({
  children,
  radius = 999,
  tint = "light",
  style = {},
  className,
  ...rest
}: GlassSurfaceProps) {
  const t = TINTS[tint];
  return (
    <div
      {...rest}
      className={className}
      style={{
        borderRadius: radius,
        background: t.bg,
        backdropFilter: t.filter,
        WebkitBackdropFilter: t.filter,
        boxShadow: `${t.edge}, ${t.shadow}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
