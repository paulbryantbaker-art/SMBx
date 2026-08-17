import { lazy, Suspense } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { LOGGED_IN_CHROME } from "./appSurfaces";

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
 * (The legacy V6Mobile shell was removed 2026-06-25 — Atlas has been the live
 * mobile shell for weeks; its shared leaves `mobile/types`, `mobile/screens/Model`,
 * and `mobile/icons` are kept.)
 * ─────────────────────────────────────────────────────────────────────────── */

const AtlasMobileApp = lazy(() => import("./atlasmobile/AtlasMobileApp"));
const AtlasApp = lazy(() => import("./desktop/AtlasApp"));
const ZeroShell = lazy(() => import("./ZeroShell"));

// The mobile (<1024px) render path.
const MobileShell = AtlasMobileApp;

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

  /* THE ZERO STATE (2026-08-16, Paul: "get rid of all of the logged in
     chrome... and start over completely"). Both shells stand behind the
     flag; the rethink is FRONT_END_ZERO.md. */
  if (!LOGGED_IN_CHROME) {
    return (
      <Suspense fallback={<div style={FULLSCREEN_CENTER}>Loading…</div>}>
        <ZeroShell user={auth.user} onSignOut={sharedProps.onSignOut} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div style={FULLSCREEN_CENTER}>Loading workspace…</div>}>
      {isDesktop ? <AtlasApp {...sharedProps} /> : <MobileShell {...sharedProps} />}
    </Suspense>
  );
}
