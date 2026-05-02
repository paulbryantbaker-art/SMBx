import type { IconName, Mode } from "./types";

export const MODES: Mode[] = [
  { id: "search",   label: "Business Search",     count: "6",   icon: "search"  },
  { id: "docs",     label: "Docs",                count: "24",  icon: "doc"     },
  { id: "analysis", label: "Analysis",            count: "11",  icon: "chart"   },
  { id: "intel",    label: "Market Intelligence", count: "87",  icon: "feed"    },
  { id: "library",  label: "Library",             count: "143", icon: "library" },
];

export function V6Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  const s = size;
  switch (name) {
    case "search":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case "doc":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 1.5h5l3 3v8H3v-11z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M8 1.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M5 8h4M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case "chart":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <rect x="3" y="7" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="6" y="4" width="2" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9" y="6" width="2" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      );
    case "feed":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 4h10M2 7h10M2 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    case "library":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="3.5" height="10" rx="0.6" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="6" y="3.5" width="3.5" height="8.5" rx="0.6" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M11 3l1.7 0.4-1.7 8.7-1.7-0.3 1.7-8.8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      );
    case "settings":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.5 2.5L4 4M10 10l1.5 1.5M2.5 11.5L4 10M10 4l1.5-1.5"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      );
    case "history":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M7 4v3l2 1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    case "plus":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      );
    case "close":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    case "pin":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1l1.7 4.5L13 7l-4.3 1.5L7 13l-1.7-4.5L1 7l4.3-1.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      );
    case "back":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "deal":
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 4l5-2.5 5 2.5v6L7 12.5 2 10V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M2 4l5 2.5 5-2.5M7 6.5V12" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      );
  }
}
