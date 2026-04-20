/**
 * Icon library for v4 chrome. Inline SVGs, one component per glyph.
 * Size/stroke controlled by parent via CSS (width/height/color).
 */

const defaults = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const IcChat = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
export const IcDeals = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M20 7h-7l-2-3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /></svg>
);
export const IcSourcing = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const IcAnalyses = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" /></svg>
);
export const IcLibrary = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
);
export const IcTeam = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const IcDrafts = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
export const IcSchedule = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const IcTrash = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);
export const IcSettings = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);
export const IcChevronRight = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M9 18l6-6-6-6" /></svg>
);
export const IcChevronLeft = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...p}><path d="M15 18l-6-6 6-6" /></svg>
);

/* Quick-action icons — slightly smaller (16) and busier glyphs. */
const qa = { ...defaults, width: 16, height: 16 };
export const IcNewDeal = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...qa} {...p}><path d="M20 7h-7l-2-3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M12 11v6M9 14h6" /></svg>
);
export const IcRundown = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...qa} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>
);
export const IcDCF = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...qa} {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg>
);
export const IcLOI = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...qa} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
);
export const IcCompare = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...qa} {...p}><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>
);

/* Lightning / spark (Yulia glyph) */
export const IcSpark = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} {...p}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
);
