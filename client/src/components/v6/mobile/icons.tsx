/* V6 Mobile — Liquid Glass icon set (outline, stroke-tuned for iOS density). */
import { type ReactElement } from "react";
import type { IconName } from "./types";

interface IconProps {
  size?: number;
  c?: string;
  active?: boolean;
}

export function MobileIcon({ name, size, c, active }: IconProps & { name: IconName }) {
  const fn = ICONS[name];
  return fn({ size, c, active });
}

const ICONS: Record<IconName, (p: IconProps) => ReactElement> = {
  chat: ({ size = 20, c = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 9.2C3 5.6 5.8 3 9.5 3H10.5C14.2 3 17 5.6 17 9.2C17 12.8 14.2 15.4 10.5 15.4H8.6L5.4 17.6C5.1 17.8 4.7 17.6 4.7 17.2V14.9C3.6 13.6 3 12 3 9.2Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  ),
  search: ({ size = 17, c = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" stroke={c} strokeWidth="1.8"/>
      <path d="M11.6 11.6L15 15" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  back: ({ size = 14, c = "currentColor" }) => (
    <svg width={size} height={(size as number) * 22 / 14} viewBox="0 0 14 22" fill="none" aria-hidden="true">
      <path d="M11 2L3 11L11 20" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  share: ({ size = 18, c = "currentColor" }) => (
    <svg width={size} height={(size as number) * 20 / 18} viewBox="0 0 18 20" fill="none" aria-hidden="true">
      <path d="M9 2V13M9 2L5.5 5.5M9 2L12.5 5.5" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10V17C3 17.6 3.4 18 4 18H14C14.6 18 15 17.6 15 17V10" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  close: ({ size = 16, c = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3L13 13M13 3L3 13" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  download: ({ size = 22, c = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9.5" stroke={c} strokeWidth="1.5"/>
      <path d="M11 6V14M11 14L7.5 10.5M11 14L14.5 10.5" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevron: ({ size = 9, c = "currentColor" }) => (
    <svg width={size} height={(size as number) * 14 / 9} viewBox="0 0 9 14" fill="none" aria-hidden="true">
      <path d="M1 1L7 7L1 13" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  star: ({ size = 12, c = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill={c} aria-hidden="true">
      <path d="M6 0.5L7.5 4L11 4.5L8.5 7L9 10.5L6 8.7L3 10.5L3.5 7L1 4.5L4.5 4L6 0.5Z"/>
    </svg>
  ),
  arrowUp: ({ size = 16, c = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  today: ({ c = "currentColor", active = false }) => (
    <svg width={22} height={22} viewBox="0 0 22 22" fill={active ? c : "none"} stroke={c} strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="3" width="14" height="16" rx="2"/>
      <path d="M4 7H18" strokeWidth="1.2"/>
    </svg>
  ),
  pipeline: ({ c = "currentColor", active = false }) => (
    <svg width={22} height={22} viewBox="0 0 22 22" fill={active ? c : "none"} stroke={c} strokeWidth="1.5" aria-hidden="true">
      <path d="M3 5L11 9L19 5L11 1L3 5Z"/>
      <path d="M3 11L11 15L19 11" strokeLinejoin="round"/>
      <path d="M3 17L11 21L19 17" strokeLinejoin="round"/>
    </svg>
  ),
  brief: ({ c = "currentColor", active = false }) => (
    <svg width={22} height={22} viewBox="0 0 22 22" fill={active ? c : "none"} stroke={c} strokeWidth="1.5" aria-hidden="true">
      <path d="M5 3H17V19H5V3Z"/>
      <path d="M8 7H14M8 11H14M8 15H12" strokeLinecap="round" strokeWidth="1.2"/>
    </svg>
  ),
  library: ({ c = "currentColor", active = false }) => (
    <svg width={22} height={22} viewBox="0 0 22 22" fill={active ? c : "none"} stroke={c} strokeWidth="1.5" aria-hidden="true">
      {/* Three vertical "books" — bound, growing slightly in height. Reads as
          a library/shelf. */}
      <path d="M4 4H7V18H4V4Z"/>
      <path d="M9 5H12V18H9V5Z"/>
      <path d="M14 7L17 6.5V18L14 18.5V7Z" strokeLinejoin="round"/>
    </svg>
  ),
};
