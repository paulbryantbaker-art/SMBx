/* Audience switcher — anon test-drive control. Lets a signed-out visitor
   flip the app between audience flavors so they can experience the right
   variant before signing up. Hidden for authed users (their audience
   should be captured via onboarding / Yulia conversation, not toggled).

   Visual: pill anchored bottom-right above the FAB, opens a small sheet
   listing the 7 audiences with a check on the active one. Designed to
   feel like an iOS-style "perspective" switcher rather than a settings
   menu — the user is testing which version of the app fits them. */

import { useState, type CSSProperties } from "react";
import { type Audience, AUDIENCES, AUDIENCE_LONG } from "../../../lib/audience";

interface AudienceSwitcherProps {
  audience: Audience;
  onChange: (a: Audience) => void;
}

export function AudienceSwitcher({ audience, onChange }: AudienceSwitcherProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Switch audience for test drive"
        aria-expanded={open}
        style={S.pill}
      >
        <span style={S.pillEyebrow}>VIEWING AS</span>
        <span style={S.pillLabel}>{AUDIENCE_LONG[audience]}</span>
        <span style={S.pillChevron} aria-hidden="true">⌄</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close audience picker"
            onClick={() => setOpen(false)}
            style={S.scrim}
          />
          <div role="dialog" aria-modal="true" aria-label="Pick a test-drive audience" style={S.sheet}>
            <div style={S.sheetHandle} aria-hidden="true" />
            <div style={S.sheetEyebrow}>TEST DRIVE AS</div>
            <div style={S.sheetTitle}>Try the app from a different chair</div>
            <p style={S.sheetSub}>
              Each audience reshapes what Today shows, the language Yulia uses,
              and what the homepage suggests you do next.
            </p>
            <ul style={S.list}>
              {AUDIENCES.map(a => {
                const active = a === audience;
                return (
                  <li key={a}>
                    <button
                      type="button"
                      onClick={() => { onChange(a); setOpen(false); }}
                      aria-pressed={active}
                      style={{
                        ...S.row,
                        background: active ? "var(--mb-accent-soft)" : "transparent",
                      }}
                    >
                      <span style={{
                        ...S.rowLabel,
                        color: active ? "var(--mb-accent-ink)" : "var(--mb-ink)",
                        fontWeight: active ? 700 : 500,
                      }}>{AUDIENCE_LONG[a]}</span>
                      {active && <span aria-hidden="true" style={S.check}>✓</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div style={S.sheetFootnote}>
              Saved for this browser only — your real audience is captured when
              you sign up.
            </div>
          </div>
        </>
      )}
    </>
  );
}

const S: Record<string, CSSProperties> = {
  pill: {
    position: "fixed",
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)",
    right: 16,
    zIndex: 25,
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "7px 14px 7px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    border: "none",
    boxShadow:
      "0 0 0 0.5px rgba(0,0,0,0.05)," +
      "0 1px 2px rgba(0,0,0,0.06)," +
      "0 6px 18px -6px rgba(0,0,0,0.1)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    cursor: "pointer",
    fontFamily: "var(--mb-font-body)",
    transition: "transform 160ms cubic-bezier(0.25, 1, 0.5, 1)",
  },
  pillEyebrow: {
    fontFamily: "var(--mb-font-mono)",
    fontSize: 9.5, fontWeight: 600,
    letterSpacing: "0.08em",
    color: "var(--mb-ink-3)",
    textTransform: "uppercase",
  },
  pillLabel: {
    fontSize: 13, fontWeight: 600,
    color: "var(--mb-ink-1)",
    letterSpacing: "-0.1px",
  },
  pillChevron: {
    fontSize: 11, color: "var(--mb-ink-3)",
    marginLeft: 1, lineHeight: 1,
  },

  scrim: {
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(15,17,30,0.32)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    border: "none",
    cursor: "pointer",
    animation: "mb-fade-up 200ms cubic-bezier(0.25, 1, 0.5, 1)",
  },
  sheet: {
    position: "fixed",
    left: 0, right: 0, bottom: 0,
    zIndex: 101,
    background: "#FFFFFF",
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: "10px 22px calc(env(safe-area-inset-bottom, 0px) + 24px)",
    boxShadow: "0 -10px 40px -10px rgba(0,0,0,0.18)",
    animation: "mb-slide-up 320ms cubic-bezier(0.32, 0.72, 0, 1)",
  },
  sheetHandle: {
    width: 36, height: 4,
    margin: "0 auto 14px",
    borderRadius: 2,
    background: "var(--mb-line)",
  },
  sheetEyebrow: {
    fontFamily: "var(--mb-font-mono)",
    fontSize: 10.5, fontWeight: 600,
    letterSpacing: "0.08em",
    color: "var(--mb-accent-ink)",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.45px",
    color: "var(--mb-ink)",
    margin: 0,
    textWrap: "balance",
  },
  sheetSub: {
    fontSize: 13.5, color: "var(--mb-ink-3)",
    lineHeight: 1.45, margin: "8px 0 16px",
    textWrap: "pretty",
  },
  list: {
    listStyle: "none", padding: 0, margin: "0 0 12px",
  },
  row: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%",
    padding: "13px 14px",
    border: "none", borderRadius: 12,
    cursor: "pointer",
    fontFamily: "var(--mb-font-body)",
    transition: "background-color 160ms ease",
  },
  rowLabel: {
    fontSize: 16, letterSpacing: "-0.15px",
    textAlign: "left",
  },
  check: {
    fontSize: 16, color: "var(--mb-accent-ink)",
    fontWeight: 700,
  },
  sheetFootnote: {
    fontSize: 11.5, color: "var(--mb-ink-4)",
    textAlign: "center",
    paddingTop: 8,
  },
};
