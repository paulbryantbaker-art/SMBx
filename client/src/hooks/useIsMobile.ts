import { useEffect, useState } from "react";

// Switch to the V6Mobile app for any window under 900px. Aligns with the
// marketing site's 900px breakpoint and the desktop shell's cramped-below-980
// layout, so both surfaces go narrow at the same width.
const MOBILE_BREAKPOINT = "(max-width: 900px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_BREAKPOINT).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
