import { lazy, Suspense } from "react";
import { useAuth } from "../../hooks/useAuth";

/* ───────────────────────────────────────────────────────────────────────────
 * Desktop UI fully removed (2026-06-16).
 *
 * The desktop shells (the "nd" agent-first shell and the "cd" Ramp shell) were
 * a parallel reimplementation of the deal experience. They re-derived product
 * state — "what does this deal need", how Yulia guides — separately from the
 * backend the mobile app already consumes correctly, so the two worlds drifted.
 *
 * Per direction, every bit of that desktop UI is gone from the repo. There is
 * now ONE render path: the working mobile experience renders on EVERY viewport
 * while desktop is rebuilt — as a layout over the SAME data the mobile app
 * proves works (/api/agency/deals/:id/brief, /api/deals/:id, /api/user/
 * next-actions), never a second reimplementation.
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
