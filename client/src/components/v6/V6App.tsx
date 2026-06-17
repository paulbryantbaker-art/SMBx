import { lazy, Suspense } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useIsMobile } from "../../hooks/useIsMobile";

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
// Desktop shell (rebuild in progress) — a LAYOUT over the same mobile data
// hooks/screens, never a parallel app. Renders ≥900px; mobile renders below.
const V6Desktop = lazy(() => import("./V6Desktop"));

const FULLSCREEN_CENTER = {
  display: "grid",
  placeItems: "center",
  height: "100vh",
  color: "var(--m-on-surface-mid)",
} as const;

export default function V6App() {
  const auth = useAuth();
  const isMobile = useIsMobile();

  if (auth.loading) {
    return <div style={FULLSCREEN_CENTER}>Loading…</div>;
  }

  const Shell = isMobile ? V6Mobile : V6Desktop;
  return (
    <Suspense fallback={<div style={FULLSCREEN_CENTER}>Loading workspace…</div>}>
      <Shell
        user={auth.user}
        onSignOut={async () => { await auth.logout(); }}
        onDevSignIn={auth.devSignIn}
      />
    </Suspense>
  );
}
