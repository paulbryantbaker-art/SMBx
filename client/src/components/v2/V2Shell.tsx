/**
 * V2 SHELL — the restart's chrome, grown one surface at a time.
 *
 * (SMBX_CRM_V2_SPEC.md; FRONT_END_ZERO.md process. Slice 1 ships Today +
 * Leads — the spec's own "usable CRM on day one". Pipeline, Companies,
 * People and Campaigns join the nav ONLY as they are built and used; a tab
 * that leads nowhere is exactly the jumble the last front end died of.
 *
 * 2026-08-18: Campaigns · Content joins — build order §8 step 6, pulled
 * forward on Paul's word ("build the UI to manage the campaign and you have
 * the data"). It reads the post_queue the Aug 18 plan was imported into and
 * carries each slot's copy and deck; Today's "content queued" section reads
 * the same rows.)
 *
 * Language: Carta, the site's (tokens.ts). No view toggles hiding structure
 * — what exists is a nav item, whole. Safari rule holds: nothing here is
 * position:fixed with a background.
 */
import { useEffect, useState } from "react";
import type { User } from "../../hooks/useAuth";
import { C } from "./tokens";
import LeadsScreen from "./Leads";
import TodayScreen from "./Today";
import CampaignsScreen from "./Campaigns";
import FeeCalc, { FEE_CALC_LABEL, useDocked } from "./FeeCalc";

type ScreenId = "today" | "leads" | "campaigns";

const NAV: { id: ScreenId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "leads", label: "Leads" },
  { id: "campaigns", label: "Campaigns" },
];

export default function V2Shell({ user, onSignOut }: {
  user: User | null;
  onSignOut: () => Promise<void> | void;
}) {
  const [screen, setScreen] = useState<ScreenId>("today");
  /* Today can hand Campaigns a slot to open — "content queued today → open". */
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  /* THE FEE CALCULATOR (2026-08-19, Paul: "a quick access button in menu and
     it can run in the side page gutter on any page im on currently"). One
     piece of state at the shell, so it survives Today → Leads → Campaigns.
     Remembered across reloads — a calculator you reopen every morning is one
     you stop opening. */
  const [calc, setCalc] = useState<boolean>(() => {
    try { return sessionStorage.getItem("smbx_v2_feecalc") === "1"; } catch { return false; }
  });
  // Focus the field only when the USER opened the drawer this session — a
  // reload that restores it open must not steal focus from the page.
  const [calcFocus, setCalcFocus] = useState(false);
  useEffect(() => { try { sessionStorage.setItem("smbx_v2_feecalc", calc ? "1" : "0"); } catch { /* private mode */ } }, [calc]);
  const docked = useDocked();

  /* index.css scroll-locks html/body at ≥901px for the Atlas shells' internal
     panes (`html, body { height: 100%; overflow: hidden; }`). This shell is a
     flowing document, like the practice site — Today and Leads were short
     enough never to hit the fold, Campaigns is not — so release the lock the
     same way PracticeShell does (html scrolls; body just flows; heights auto)
     and put it back on unmount, so a flip back to the Atlas shell keeps its
     lock. Safari rule untouched: nothing here is position:fixed. */
  useEffect(() => {
    const html = document.documentElement.style;
    const body = document.body.style;
    const prev = { ho: html.overflow, bo: body.overflow, hh: html.height, bh: body.height };
    html.overflow = "auto"; body.overflow = "visible"; html.height = "auto"; body.height = "auto";
    return () => { html.overflow = prev.ho; body.overflow = prev.bo; html.height = prev.hh; body.height = prev.bh; };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans, color: C.ink }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 26,
        padding: "0 28px", height: 60, borderBottom: `1px solid ${C.hair}`,
      }}>
        <img src="/logo-lockup.png" alt="smbX.ai" style={{ height: 22, width: "auto" }} />
        <nav style={{ display: "flex", gap: 4 }}>
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setScreen(id); if (id !== "campaigns") setOpenSlot(null); }}
              style={{
                font: "inherit", fontSize: 14.5, fontWeight: 600,
                color: screen === id ? C.ink : C.body,
                background: "transparent", border: "none", cursor: "pointer",
                padding: "6px 12px",
                borderBottom: `2px solid ${screen === id ? C.green : "transparent"}`,
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => { setCalc(v => !v); setCalcFocus(true); }}
          aria-pressed={calc}
          title="Success fee on a sale price — the published schedule"
          style={{
            font: "inherit", fontSize: 13, fontWeight: 700,
            color: calc ? C.green : C.body,
            background: "transparent", border: `1px solid ${calc ? C.green : C.chipBd}`,
            borderRadius: 6, padding: "6px 12px", cursor: "pointer",
          }}
        >
          {FEE_CALC_LABEL}
        </button>
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

      {/* The screen and, when open, the calculator beside it in the right
          gutter. A flex ROW with the drawer `position: sticky` keeps it in view
          while the screen scrolls — no fixed element (Safari rule). The main
          column keeps its 1080 measure; the drawer takes the gutter, and the
          pair centres as one unit so the screen shifts left by half the drawer
          rather than being covered by it. */}
      {/* `wrap`, not `wrap-reverse`: under wrap-reverse the cross axis flips and
          align-items:flex-start means the BOTTOM of the line, which parked the
          drawer low on a short screen (seen 2026-08-19). Above-vs-beside is
          done with CSS `order` instead — the drawer is order -1 (first, its own
          line) when undocked and 1 (after main, same line) when docked. */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: docked ? 28 : 18, padding: "26px 28px 80px" }}>
        {/* flex-basis 0 + grow so main SHRINKS to make room for the drawer
            (otherwise width:100% forces a wrap at every width). The 720 floor
            is where Campaigns' two-column rows stop fitting; `min(720px,100%)`
            so a phone (no drawer) is never forced wider than itself. */}
        <main style={{ flex: "1 1 0", minWidth: "min(720px, 100%)", maxWidth: 1080, order: 0 }}>
          {screen === "today" && (
            <TodayScreen
              onGoLeads={() => setScreen("leads")}
              onGoCampaigns={id => { setOpenSlot(id ?? null); setScreen("campaigns"); }}
            />
          )}
          {screen === "leads" && <LeadsScreen />}
          {screen === "campaigns" && <CampaignsScreen key={openSlot ?? "campaigns"} openQueueId={openSlot} />}
        </main>
        {calc && <FeeCalc docked={docked} focusOnOpen={calcFocus} onClose={() => setCalc(false)} />}
      </div>
    </div>
  );
}
