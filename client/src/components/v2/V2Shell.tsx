/**
 * V2 SHELL — the restart's chrome, grown one surface at a time.
 *
 * (SMBX_CRM_V2_SPEC.md; FRONT_END_ZERO.md process. Slice 1 ships Today +
 * Leads — the spec's own "usable CRM on day one". Pipeline, Companies,
 * People and Campaigns join the nav ONLY as they are built and used; a tab
 * that leads nowhere is exactly the jumble the last front end died of.)
 *
 * Language: Carta, the site's (tokens.ts). No view toggles hiding structure
 * — what exists is a nav item, whole. Safari rule holds: nothing here is
 * position:fixed with a background.
 */
import { useState } from "react";
import type { User } from "../../hooks/useAuth";
import { C } from "./tokens";
import LeadsScreen from "./Leads";
import TodayScreen from "./Today";

type ScreenId = "today" | "leads";

export default function V2Shell({ user, onSignOut }: {
  user: User | null;
  onSignOut: () => Promise<void> | void;
}) {
  const [screen, setScreen] = useState<ScreenId>("today");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans, color: C.ink }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 26,
        padding: "0 28px", height: 60, borderBottom: `1px solid ${C.hair}`,
      }}>
        <img src="/logo-lockup.png" alt="smbX.ai" style={{ height: 22, width: "auto" }} />
        <nav style={{ display: "flex", gap: 4 }}>
          {(["today", "leads"] as const).map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setScreen(id)}
              style={{
                font: "inherit", fontSize: 14.5, fontWeight: 600,
                color: screen === id ? C.ink : C.body,
                background: "transparent", border: "none", cursor: "pointer",
                padding: "6px 12px",
                borderBottom: `2px solid ${screen === id ? C.green : "transparent"}`,
                marginBottom: -1,
              }}
            >
              {id === "today" ? "Today" : "Leads"}
            </button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: C.mono, fontSize: 12, color: C.muted }}>
          {user?.email ?? ""}
        </span>
        <button
          type="button"
          onClick={() => onSignOut()}
          style={{
            font: "inherit", fontSize: 13, fontWeight: 600, color: C.body,
            background: "transparent", border: `1px solid ${C.chipBd}`,
            borderRadius: 6, padding: "6px 12px", cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 28px 80px" }}>
        {screen === "today" ? <TodayScreen onGoLeads={() => setScreen("leads")} /> : <LeadsScreen />}
      </main>
    </div>
  );
}
