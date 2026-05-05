/* Audience switcher — anon test-drive control. Lets a signed-out visitor
   flip the app between audience flavors so they can experience the right
   variant before signing up. Hidden for authed users (their audience
   should be captured via onboarding / Yulia conversation, not toggled).

   Visual: pill anchored bottom-right above the FAB, opens a small sheet
   listing the 7 audiences with a check on the active one. Designed to
   feel like an iOS-style "perspective" switcher rather than a settings
   menu — the user is testing which version of the app fits them. */

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { type Audience, AUDIENCES, AUDIENCE_LABELS, AUDIENCE_LONG } from "../../../lib/audience";

interface AudienceSwitcherProps {
  audience: Audience;
  onChange: (a: Audience) => void;
}

export function AudienceSwitcher({ audience, onChange }: AudienceSwitcherProps) {
  const [open, setOpen] = useState(false);

  // Lock scroll while the sheet is open. We lock both <html> and <body>
  // because iOS Safari tab mode uses body as the native scroll
  // container — overflow:hidden on html alone leaves body free.
  // The scrim itself has touch-action:none in S.scrim so finger drags
  // can't pass through to the page beneath.
  // We accept the chrome-lock side-effect documented at V6Mobile.tsx:96
  // (post-paint body inline-style mutation locks the chrome
  // translucency mode) — same trade-off LearnSheet already takes.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [open]);

  // Portal the sheet to document.body so any ancestor with
  // `overflow: hidden` (the Explore card has it; the welcome hero does
  // too — that's an iOS-style cropped texture card) doesn't clip the
  // overlay. Without the portal the scrim and sheet rendered "inside"
  // the card and got cut off, which made the popup look broken.
  const overlay = open && typeof document !== "undefined"
    ? createPortal(
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
        </>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        aria-label={`Switch audience for test drive, currently ${AUDIENCE_LONG[audience]}`}
        aria-expanded={open}
        style={S.pill}
      >
        <span style={S.pillEyebrow}>VIEWING AS</span>
        <span style={S.pillLabel}>{AUDIENCE_LABELS[audience]}</span>
        <span style={S.pillChevron} aria-hidden="true">⌄</span>
      </button>
      {overlay}
    </>
  );
}

const S: Record<string, CSSProperties> = {
  /* Pill is inline-flow now (no position:fixed) — caller decides where
     to render it. Designed to read against either the white app surface
     OR a colored card backdrop (Explore card uses a purple watercolor
     gradient), which is why the rgba(255,255,255,0.92) reads as a
     "frosted chip" rather than a flat white pill. */
  pill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 11px 5px 9px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    border: "none",
    boxShadow:
      "0 0 0 0.5px rgba(0,0,0,0.06)," +
      "0 1px 2px rgba(0,0,0,0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    cursor: "pointer",
    fontFamily: "var(--mb-font-body)",
    flexShrink: 0,
    whiteSpace: "nowrap" as const,
    transition: "transform 160ms cubic-bezier(0.25, 1, 0.5, 1)",
  },
  pillEyebrow: {
    fontFamily: "var(--mb-font-mono)",
    fontSize: 8.5, fontWeight: 600,
    letterSpacing: "0.08em",
    color: "var(--mb-ink-3)",
    textTransform: "uppercase",
  },
  pillLabel: {
    fontSize: 12, fontWeight: 600,
    color: "var(--mb-ink-1)",
    letterSpacing: "-0.1px",
  },
  pillChevron: {
    fontSize: 10, color: "var(--mb-ink-3)",
    marginLeft: 1, lineHeight: 1,
  },

  scrim: {
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(15,17,30,0.32)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    border: "none",
    cursor: "pointer",
    /* touch-action: none stops finger drags on the scrim from
       scrolling the page beneath. Combined with the body+html overflow
       lock above, this kills both touch- and scroll-event paths. */
    touchAction: "none",
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
