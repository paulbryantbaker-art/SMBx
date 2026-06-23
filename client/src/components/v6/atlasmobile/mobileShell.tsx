/**
 * Mobile-only shell context — lets a screen open the full-screen Ask Yulia chat
 * surface (and close it). Kept separate from the shared desktop `atlasNav` so the
 * canonical AtlasNav interface stays unchanged; this is the mobile twin of how the
 * shell already keeps `moreOpen` out of the AtlasView union.
 */
import { createContext, useContext } from "react";

export interface MobileShell {
  /** Open the full-screen Ask Yulia chat surface. */
  openChat: () => void;
  /** Close it (back to the underlying screen). */
  closeChat: () => void;
  /** Sign the user out (surfaced as a destructive action in the Menu). */
  signOut: () => void;
}

export const MobileShellContext = createContext<MobileShell | null>(null);

export function useMobileShell(): MobileShell | null {
  return useContext(MobileShellContext);
}
