/* V6 Mobile — Liquid Glass surface primitive.
   Keep blur low enough that textured cards stay crisp; the edge/highlight does the glass work. */

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
    bg: "rgba(255,255,255,0.44)",
    filter: "blur(10px) saturate(190%) contrast(1.08) brightness(1.06)",
    edge: "inset 0 0 0 0.5px rgba(255,255,255,0.78), inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -1px 0 rgba(255,255,255,0.18)",
    shadow: "0 1px 3px rgba(0,0,0,0.04), 0 14px 28px -12px rgba(0,0,0,0.14)",
  },
  chrome: {
    bg: "rgba(255,255,255,0.50)",
    filter: "blur(12px) saturate(200%) contrast(1.08) brightness(1.07)",
    edge: "inset 0 0 0 0.5px rgba(255,255,255,0.82), inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -1px 0 rgba(255,255,255,0.16)",
    shadow: "0 1px 0 rgba(0,0,0,0.04), 0 16px 32px -14px rgba(0,0,0,0.18)",
  },
  dark: {
    bg: "rgba(31,32,43,0.52)",
    filter: "blur(14px) saturate(185%) contrast(1.08) brightness(0.98)",
    edge: "inset 0 0 0 0.5px rgba(255,255,255,0.26), inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(255,255,255,0.08)",
    shadow: "0 1px 3px rgba(0,0,0,0.20), 0 18px 34px -14px rgba(0,0,0,0.48)",
  },
  onColor: {
    bg: "rgba(255,255,255,0.13)",
    filter: "blur(4px) saturate(155%) contrast(1.1) brightness(1.04)",
    edge: "inset 0 0 0 0.5px rgba(255,255,255,0.44), inset 0 1px 0 rgba(255,255,255,0.34), inset 0 -1px 0 rgba(255,255,255,0.10)",
    shadow: "0 10px 24px -18px rgba(0,0,0,0.38)",
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
