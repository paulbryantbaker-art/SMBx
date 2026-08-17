/**
 * ZERO SHELL — the logged-in app while the front end is rethought.
 *
 * (2026-08-16 night, Paul: "let's get rid of all of the logged in chrome in
 * app... and start over completely. The backend as you just said, stays
 * intact, we just need to really think through properly how the front end
 * should work.")
 *
 * DELIBERATELY ALMOST NOTHING. Even "chat-first" is a design decision the
 * rethink should make on purpose rather than inherit by default, so this
 * shell asserts no workflow at all: the mark, an honest sentence about what
 * is happening, what still stands, and sign-out. Both viewports get the same
 * page — the desktop/mobile fork is itself part of what gets rethought.
 *
 * The whole previous front end survives behind flags and git history
 * (appSurfaces.ts); the backend — every route, table, migration, Yulia's
 * tools — is untouched and reachable by API. FRONT_END_ZERO.md is the
 * rethink brief.
 *
 * Safari rule honoured: no position:fixed full-viewport background.
 */
import type { User } from "../../hooks/useAuth";

export default function ZeroShell({ user, onSignOut }: {
  user: User | null;
  onSignOut: () => Promise<void> | void;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
      <div style={{
        maxWidth: 560, margin: "0 auto", padding: "18vh 24px 40px",
        display: "flex", flexDirection: "column", gap: 18, flex: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif',
      }}>
        <img src="/logo-lockup.png" alt="smbX.ai" style={{ height: 26, width: "auto", alignSelf: "flex-start" }} />

        <div style={{ fontSize: 21, fontWeight: 700, color: "#16181A", letterSpacing: "-0.01em", marginTop: 8 }}>
          The workspace is being rebuilt from zero.
        </div>

        <p style={{ margin: 0, fontSize: 14.5, color: "#4A4F54", lineHeight: 1.65 }}>
          The front end came down on purpose{user?.email ? ` — you're signed in as ${user.email}` : ""}.
          Everything underneath stands: the deal engine (DEFINITIVE, THE LINE),
          every table and route, the studio in Cowork, and the public site.
          Nothing was lost; the next surface gets designed from the way the
          practice actually works, one screen at a time.
        </p>

        <p style={{ margin: 0, fontSize: 13.5, color: "#7C8187", lineHeight: 1.6 }}>
          Meanwhile: research, collateral and the posting campaign run from
          Cowork; the Acquisition Engine on the public site keeps taking leads.
        </p>

        <button
          type="button"
          onClick={() => onSignOut()}
          style={{
            alignSelf: "flex-start", marginTop: 10,
            font: "inherit", fontSize: 13.5, fontWeight: 600, color: "#16181A",
            background: "#FFFFFF", border: "1px solid #D8D3C6", borderRadius: 999,
            padding: "8px 18px", cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
