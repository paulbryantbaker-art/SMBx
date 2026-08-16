/**
 * THE LOGO — the real mark, one component, everywhere.
 *
 * Paul, 2026-08-16: *"actually use the correct logo everywhere."*
 *
 * ── WHAT WAS THERE ──────────────────────────────────────────────────────
 * Nothing. The app header rendered `<Sparkle/>` — a Unicode **✦** with a
 * gradient text-fill, left over from the Gemini-home era — beside the word
 * "Atlas" (the shell's internal codename), and seventeen other places rendered
 * the same glyph as an AI indicator. The practice site has used the real mark
 * for months; the app had never used it once.
 *
 * Carta also has exactly ONE accent and no gradients, so a two-stop gradient
 * glyph was off-language on top of being the wrong mark.
 *
 * ── THE ASSETS, AND WHY THERE ARE NEW ONES ──────────────────────────────
 * `logo-green-x.png` is 1584×396 and carries **13.26% transparent padding on
 * the left, 13.32% on the right** — measured by scanning the alpha channel,
 * not assumed. At a 38px render that is 20px of nothing before the ink starts,
 * which is exactly why the practice site carries
 * `[data-nav-logo] { margin-left: -20px }`: a correction coupled to both the
 * asset AND the height, found only after Paul reported the same misalignment
 * twice and three different centre measurements all read "correct".
 *
 * So this component does not use that asset. `scripts/studio/crop-logo.py`
 * bakes a TIGHT pair — `logo-lockup.png` / `logo-lockup-dark.png`, 1163×367,
 * verified at zero padding on all four sides — and this renders those. A tight
 * asset needs no correction, which means the next person to place it cannot
 * place it wrong. The originals are untouched: the public site is built around
 * their padding and re-cropping underneath it would shift every placement
 * there.
 *
 * ── SIZED BY HEIGHT, ALWAYS ─────────────────────────────────────────────
 * Both variants take a `height` and derive the width from the real aspect
 * ratio. Passing a width would let the two get out of step, and a stretched
 * logo is the one brand mistake everybody notices — it is also literally the
 * bug the practice site's `.cv-logo { align-self: flex-start }` exists to fix,
 * where a column flexbox stretched the 4:1 mark.
 */
import type { CSSProperties } from "react";
import { T } from "./atlasTokens";

/* Measured from the baked assets. If crop-logo.py is re-run against a new
   master these change, and they are the only two numbers in this file. */
const LOCKUP_RATIO = 1163 / 367; // 3.169
const MARK_RATIO = 347 / 365; // 0.951

/**
 * The full lockup — wordmark plus the green X. Use in the app header and
 * anywhere the surface is naming the PRODUCT.
 *
 * `tone="dark"` swaps to the light-on-dark master rather than filtering the
 * light one, because an `invert()` on a two-colour mark turns Deal Green into
 * magenta.
 */
export function Logo({ height = 26, tone = "light", style }: {
  height?: number;
  tone?: "light" | "dark";
  style?: CSSProperties;
}) {
  return (
    <img
      src={tone === "dark" ? "/logo-lockup-dark.png" : "/logo-lockup.png"}
      alt="smbX"
      width={Math.round(height * LOCKUP_RATIO)}
      height={height}
      style={{
        height,
        width: Math.round(height * LOCKUP_RATIO),
        // A column flexbox will stretch an img given the chance; the practice
        // site hit exactly this and fixed it with align-self. Belt and braces.
        flex: "none",
        alignSelf: "center",
        display: "block",
        ...style,
      }}
    />
  );
}

/**
 * The X alone. Use where a full lockup will not fit — an inline indicator, a
 * collapsed rail, a favicon-scale slot.
 *
 * `logo-x-green.png` is already tight (0% padding, measured), so unlike the
 * lockup it needed no bake.
 *
 * THIS REPLACED THE SPARKLE as Yulia's mark. A house X reads as "this is
 * smbX's assistant", which is true, where a generic ✦ read as "some AI" — and
 * it did so in a gradient the design system does not have.
 */
export function Mark({ height = 17, style }: { height?: number; style?: CSSProperties }) {
  return (
    <img
      src="/logo-x-green.png"
      alt=""
      aria-hidden="true"
      width={Math.round(height * MARK_RATIO)}
      height={height}
      style={{
        height,
        width: Math.round(height * MARK_RATIO),
        flex: "none",
        display: "block",
        ...style,
      }}
    />
  );
}

/**
 * The lockup as a link home. The app's header cluster — one place, so the
 * click target and the mark can never disagree about their bounds.
 */
export function LogoHome({ onClick, height = 26 }: { onClick?: () => void; height?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="smbX — go to Today"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        margin: 0,
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        flex: "none",
        // The focus ring is the app's, not the browser's default.
        borderRadius: 10,
        outlineColor: T.blue,
      }}
    >
      <Logo height={height} />
    </button>
  );
}
