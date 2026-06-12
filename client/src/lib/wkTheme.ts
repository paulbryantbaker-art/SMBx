/**
 * Workspace chrome themes (desktop V6 shell).
 *
 * A theme repaints the SHELL ONLY — ground, nav, nested surfaces, hairlines —
 * via token overrides scoped to `.v6-root.wk[data-wk-theme=…]` in
 * workspace.css. Brand accent (neon CTA), verdict semantics (two-greens law),
 * ink, and all content tokens are untouched, so every theme stays on-system.
 *
 * - paper       the default warm ground (no override block)
 * - goldengate  Golden Gate fog — warm sand chrome with International-Orange
 *               tinted hairlines
 * - neoblue     Neo Blue — icy blue chrome with navy-tinted hairlines
 */
export type WkTheme = "paper" | "platinum" | "goldengate" | "neoblue";

const STORAGE_KEY = "smbx_wk_theme";

export const WK_THEMES: Array<{ id: WkTheme; label: string; sub: string; swatch: { bg: string; nav: string; line: string } }> = [
  { id: "paper", label: "Paper", sub: "Warm working-paper ground", swatch: { bg: "#FBFAF6", nav: "#F3F1EA", line: "rgba(25,24,19,0.16)" } },
  { id: "platinum", label: "Platinum", sub: "macOS-style cool gray", swatch: { bg: "#F5F6F8", nav: "#EAEDF1", line: "rgba(50,60,75,0.18)" } },
  { id: "goldengate", label: "Golden Gate", sub: "Fog and bridge-orange tint", swatch: { bg: "#FBF5EE", nav: "#F6EADC", line: "rgba(122,56,24,0.18)" } },
  { id: "neoblue", label: "Neo Blue", sub: "Icy blue, navy hairlines", swatch: { bg: "#EFF5FC", nav: "#DCE9F7", line: "rgba(25,72,140,0.22)" } },
];

export function normalizeWkTheme(value: unknown): WkTheme {
  return value === "goldengate" || value === "neoblue" || value === "platinum" ? value : "paper";
}

export function loadWkTheme(): WkTheme {
  try {
    return normalizeWkTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return "paper";
  }
}

export function saveWkTheme(theme: WkTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch { /* ignore */ }
}
