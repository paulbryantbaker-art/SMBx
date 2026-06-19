/**
 * Atlas inline SVG icon set. All glyphs are stroked `currentColor` (set color
 * on the wrapping element / via the `c` prop) and accept a `size`. These match
 * the design's stroke-2 round-cap line icons from /tmp/atlas_maps/00.
 */
import type { CSSProperties } from "react";

export interface IconProps {
  size?: number;
  /** Stroke color — defaults to currentColor so callers can set it on a parent. */
  c?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}

function svgProps(size: number, style?: CSSProperties) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true,
    style,
  };
}

export function SearchIcon({ size = 21, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

export function HelpIcon({ size = 21, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  );
}

export function BellIcon({ size = 21, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function PlusIcon({ size = 20, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function SendArrowIcon({ size = 17, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function MonitorIcon({ size = 13, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function DownloadIcon({ size = 16, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function CloseIcon({ size = 16, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function BackIcon({ size = 16, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function CheckIcon({ size = 14, c = "currentColor", style, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l4.5 4.5L19 7" />
    </svg>
  );
}

/* ─── Mobile bottom-nav glyphs (shared with the Atlas-mobile shell) ───────
 * The five floating-tab-bar icons. Same signature/style as the icons above:
 * stroked currentColor, `size` + `c` props, viewBox 0 0 24 24, sw 2. Paths are
 * verbatim from the Atlas-mobile shell spec (m4 §1d). Additive — nothing above
 * is changed. */

export function HomeIcon({ size = 22, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" />
    </svg>
  );
}

export function PipelineBarsIcon({ size = 22, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="10" y="4" width="5" height="11" rx="1.5" />
      <rect x="17" y="4" width="4" height="14" rx="1.5" />
    </svg>
  );
}

export function DealsListIcon({ size = 22, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

export function FolderIcon({ size = 22, c = "currentColor", style, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function MoreDotsIcon({ size = 22, c = "currentColor", style }: IconProps) {
  return (
    <svg {...svgProps(size, style)} fill={c} stroke="none">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

/** Settings-pane glyphs — single-path stroke icons (paths from /tmp/atlas_maps/01). */
export const SETTINGS_ICON_PATHS: Record<string, string> = {
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0",
  billing: "M3 7h18v12H3zM3 11h18",
  notifications: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9",
  members: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 0 0 0-6",
  connections: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
  security: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z",
};

export function SettingsGlyph({ pane, size = 19, c = "currentColor", style }: IconProps & { pane: string }) {
  const d = SETTINGS_ICON_PATHS[pane] ?? SETTINGS_ICON_PATHS.profile;
  return (
    <svg {...svgProps(size, style)} stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
