import { lazy, Suspense } from "react";
import { useAuth } from "../../hooks/useAuth";

/* ───────────────────────────────────────────────────────────────────────────
 * One render path: the working mobile experience renders on EVERY viewport.
 *
 * The CD "smbx Desktop" implementation was removed on 2026-06-17 — the layout
 * direction is being re-approached (Google Docs / Gemini language) by Claude
 * Design. The guardrails for the next attempt still stand: DESKTOP_REBUILD_BRIEF
 * (one render path, reuse mobile data/hooks, never a parallel app) and
 * DESKTOP_BACKEND_MAP (what backend already exists). Until that lands, mobile
 * is the whole app on desktop too.
 * ─────────────────────────────────────────────────────────────────────────── */

const V6Mobile = lazy(() => import("./mobile/V6Mobile"));

const FULLSCREEN_CENTER = {
  display: "grid",
  placeItems: "center",
  height: "100vh",
  color: "var(--m-on-surface-mid)",
} as const;

export default function V6App() {
  const auth = useAuth();

  if (auth.loading) {
    return <div style={FULLSCREEN_CENTER}>Loading…</div>;
  }

  return (
    <Suspense fallback={<div style={FULLSCREEN_CENTER}>Loading workspace…</div>}>
      <V6Mobile
        user={auth.user}
        onSignOut={async () => { await auth.logout(); }}
        onDevSignIn={auth.devSignIn}
      />
    </Suspense>
  );
}
