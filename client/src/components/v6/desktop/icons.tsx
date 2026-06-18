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
