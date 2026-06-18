import { lazy, Suspense } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useIsDesktop } from "../../hooks/useIsDesktop";

/* ───────────────────────────────────────────────────────────────────────────
 * Two render paths, split by viewport at 1024px:
 *   - ≥1024px → the Atlas desktop shell (AtlasApp).
 *   - <1024px → the working mobile experience (V6Mobile), unchanged.
 *
 * Both shells take the SAME three props from one useAuth() instance and call
 * the SAME hooks internally (useAuthChat/useAnonymousChat, useMobileDeals, …) —
 * there is no parallel data path. See DESKTOP_REBUILD_BRIEF and the Atlas build
 * contract for the one-data-layer law.
 * ─────────────────────────────────────────────────────────────────────────── */

const V6Mobile = lazy(() => import("./mobile/V6Mobile"));
const AtlasApp = lazy(() => import("./desktop/AtlasApp"));

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
      {isDesktop ? <AtlasApp {...sharedProps} /> : <V6Mobile {...sharedProps} />}
    </Suspense>
  );
}
