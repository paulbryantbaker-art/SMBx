import { lazy, Suspense } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useIsDesktop } from "../../hooks/useIsDesktop";

/* ───────────────────────────────────────────────────────────────────────────
 * Two render paths, split by viewport at 1024px:
 *   - ≥1024px → the Atlas desktop shell (AtlasApp).
 *   - <1024px → the Atlas-mobile shell (AtlasMobileApp), the Atlas-language
 *               replacement for V6Mobile.
 *
 * Both shells take the SAME three props from one useAuth() instance and call
 * the SAME hooks internally (useAuthChat/useAnonymousChat, useMobileDeals, …) —
 * there is no parallel data path. See DESKTOP_REBUILD_BRIEF and the Atlas build
 * contract for the one-data-layer law.
 *
 * V6Mobile is kept lazily importable as a fallback (the legacy mobile app) —
 * NOT deleted. Swap `MobileShell` back to it if AtlasMobileApp needs to be
 * disabled.
 * ─────────────────────────────────────────────────────────────────────────── */

// Legacy mobile app — kept as a fallback, no longer the default mobile render.
const V6Mobile = lazy(() => import("./mobile/V6Mobile"));
const AtlasMobileApp = lazy(() => import("./atlasmobile/AtlasMobileApp"));
const AtlasApp = lazy(() => import("./desktop/AtlasApp"));

// The mobile (<1024px) render path. Points at the Atlas-mobile shell; flip this
// to `V6Mobile` to fall back to the legacy mobile app.
const MobileShell = AtlasMobileApp;
// Reference V6Mobile so the fallback import isn't tree-shaken / flagged unused.
void V6Mobile;

const FULLSCREEN_CENTER = {
  display: "grid",
  placeItems: "center",
  height: "100vh",
  color: "var(--m-on-surface-mid)",
} as const;

export default function V6App() {
  const auth = useAuth();
  const isDesktop = useIsDesktop();

  if (auth.loading) {
    return <div style={FULLSCREEN_CENTER}>Loading…</div>;
  }

  const sharedProps = {
    user: auth.user,
    onSignOut: async () => { await auth.logout(); },
    onDevSignIn: auth.devSignIn,
  };

  return (
    <Suspense fallback={<div style={FULLSCREEN_CENTER}>Loading workspace…</div>}>
      {isDesktop ? <AtlasApp {...sharedProps} /> : <MobileShell {...sharedProps} />}
    </Suspense>
  );
}
