/* V6 Mobile — Add-a-deal sheet (Liquid-Glass bottom sheet).
   Chat-first by design: there is NO REST deal-creation endpoint. The sheet
   collects structured fields, composes a clean prompt, and hands it to the
   shell via onSubmit — Yulia creates the deal in chat (including any staged
   action confirm), and the user watches it happen. Mirrors the account /
   notifications sheet surface (scrim + glass gradient + grab handle +
   safe-area) and the ChatStarterPill 16px-input convention (no iOS zoom). */

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { MobileIcon } from "./icons";

type Journey = "buy" | "sell" | "raise";

const JOURNEYS: { value: Journey; label: string }[] = [
  { value: "buy", label: "Buying" },
  { value: "sell", label: "Selling" },
  { value: "raise", label: "Raising" },
];

/* Entrance — simple transform/opacity, killed under prefers-reduced-motion
   (same <style>-tag pattern as Today's fit-tick CSS). */
const SHEET_CSS = `
@keyframes mb-adds-rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mb-adds-fade { from { opacity: 0; } to { opacity: 1; } }
.mb-adds-sheet { animation: mb-adds-rise 260ms cubic-bezier(0.25, 1, 0.5, 1) both; }
.mb-adds-scrim { animation: mb-adds-fade 200ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .mb-adds-sheet, .mb-adds-scrim { animation: none !important; }
}`;

export function AddDealSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}) {
  // State lives above the `open` gate so a plain close preserves the draft;
  // only a successful submit resets it.
  const [name, setName] = useState("");
  const [journey, setJourney] = useState<Journey | null>(null);
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [revenue, setRevenue] = useState("");
  const [notes, setNotes] = useState("");

  // Lock background scroll while open (LearnSheet convention) — prevents the
  // underlying tab from rubber-banding when the user scrolls in the sheet.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const canSubmit = Boolean(name.trim()) && journey !== null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !journey) return;
    const parts = [
      `Add a deal to my pipeline: ${name.trim()}.`,
      `Journey: ${journey}.`,
    ];
    if (industry.trim()) parts.push(`Industry: ${industry.trim()}.`);
    if (location.trim()) parts.push(`Location: ${location.trim()}.`);
    // Revenue passes through exactly as typed ("5.4M", "5,400,000", …) —
    // Yulia parses it; zero client-side reinterpretation of money.
    if (revenue.trim()) parts.push(`Revenue: approximately ${revenue.trim()}.`);
    if (notes.trim()) parts.push(`Notes: ${notes.trim()}.`);
    parts.push("Set it up at the right starting gate and tell me what you need next.");
    onSubmit(parts.join(" "));
    // Successful submit → reset for next time (shell closes + opens chat).
    setName("");
    setJourney(null);
    setIndustry("");
    setLocation("");
    setRevenue("");
    setNotes("");
  };

  return (
    <>
      <style>{SHEET_CSS}</style>
      <div className="mb-adds-scrim" onClick={onClose} style={S.scrim} aria-hidden="true" />
      <div className="mb-adds-sheet" style={S.sheet} role="dialog" aria-modal="true" aria-label="Add a deal">
        <div style={S.grab} aria-hidden="true" />
        <header style={S.header}>
          <div>
            <h2 style={S.title}>Add a deal</h2>
            <p style={S.sub}>Yulia will set it up in your pipeline.</p>
          </div>
          <button type="button" className="mb-tap" onClick={onClose} aria-label="Close" style={S.closeBtn}>
            <MobileIcon name="close" c="var(--mb-ink-2)" size={22} />
          </button>
        </header>

        <form onSubmit={handleSubmit} style={S.form}>
          <div style={S.scroll}>
            <label style={S.field}>
              <span style={S.label}>Business name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summit HVAC Services"
                autoComplete="off"
                autoCorrect="off"
                style={S.input}
              />
            </label>

            <div style={S.field} role="group" aria-label="Journey">
              <span style={S.label}>Journey</span>
              <div style={S.segRow}>
                {JOURNEYS.map(({ value, label }) => {
                  const on = journey === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className="mb-tap"
                      aria-pressed={on}
                      onClick={() => setJourney(value)}
                      style={{ ...S.segBtn, ...(on ? S.segBtnOn : null) }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={S.field}>
              <span style={S.label}>Industry <em style={S.opt}>optional</em></span>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Commercial HVAC"
                autoComplete="off"
                style={S.input}
              />
            </label>

            <label style={S.field}>
              <span style={S.label}>Location <em style={S.opt}>optional</em></span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Denver, CO"
                autoComplete="off"
                style={S.input}
              />
            </label>

            <label style={S.field}>
              <span style={S.label}>Annual revenue (approx.) <em style={S.opt}>optional</em></span>
              <input
                type="text"
                inputMode="decimal"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="e.g. 5.4M or 5,400,000"
                autoComplete="off"
                style={S.input}
              />
            </label>

            <label style={S.field}>
              <span style={S.label}>Anything else Yulia should know? <em style={S.opt}>optional</em></span>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Broker-listed, owner retiring, seen the books…"
                style={S.textarea}
              />
            </label>
          </div>

          <div style={S.footer}>
            <button
              type="submit"
              className="mb-tap"
              disabled={!canSubmit}
              style={{ ...S.cta, ...(canSubmit ? null : S.ctaDisabled) }}
            >
              Ask Yulia to add it
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const S: Record<string, CSSProperties> = {
  /* Scrim + sheet mirror the account/notifications sheets: semi-transparent
     overlay (not an opaque background div — Safari toolbar rule) at 9998,
     glass sheet at 9999. */
  scrim: { position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.28)" },
  sheet: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9999,
    maxHeight: "90vh", display: "flex", flexDirection: "column",
    background: "linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.84))",
    WebkitBackdropFilter: "blur(30px) saturate(190%)", backdropFilter: "blur(30px) saturate(190%)",
    borderTop: "1px solid rgba(255,255,255,.7)", borderRadius: "22px 22px 0 0",
    boxShadow: "0 -22px 54px -20px rgba(25,24,19,.42)",
    paddingTop: 10,
  },
  grab: { width: 38, height: 4, borderRadius: 2, background: "var(--mb-ink-5)", margin: "0 auto 10px", flex: "none" },
  header: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: 10, padding: "0 16px 12px", flex: "none",
  },
  title: {
    margin: 0, fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 19, letterSpacing: "-0.01em", color: "var(--mb-ink)",
  },
  sub: {
    margin: "3px 0 0", fontFamily: "var(--mb-font-body)",
    fontSize: 13, lineHeight: 1.4, color: "var(--mb-ink-3)",
  },
  closeBtn: {
    flex: "none", width: 44, height: 44, margin: "-8px -10px 0 0",
    background: "transparent", border: "none", cursor: "pointer",
    display: "grid", placeItems: "center", borderRadius: 12,
  },
  form: { display: "flex", flexDirection: "column", minHeight: 0, flex: 1 },
  scroll: {
    flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch",
    padding: "2px 16px 8px", display: "flex", flexDirection: "column", gap: 14,
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontFamily: "var(--mb-font-body)", fontSize: 13, fontWeight: 600,
    color: "var(--mb-ink-2)",
  },
  opt: { fontStyle: "normal", fontWeight: 500, color: "var(--mb-ink-4)" },
  /* 16px font on every input — iOS zoom guard (ChatStarterPill convention);
     44px+ touch heights throughout. */
  input: {
    minHeight: 46, padding: "11px 13px",
    border: "1px solid var(--mb-line)", borderRadius: 12,
    background: "var(--mb-card)", color: "var(--mb-ink)",
    fontFamily: "var(--mb-font-body)", fontSize: 16, lineHeight: 1.4,
    outline: "none", width: "100%",
  },
  textarea: {
    padding: "11px 13px", resize: "none",
    border: "1px solid var(--mb-line)", borderRadius: 12,
    background: "var(--mb-card)", color: "var(--mb-ink)",
    fontFamily: "var(--mb-font-body)", fontSize: 16, lineHeight: 1.4,
    outline: "none", width: "100%",
  },
  segRow: { display: "flex", gap: 8 },
  segBtn: {
    flex: 1, minHeight: 48, padding: "0 4px",
    border: "1px solid var(--mb-line)", borderRadius: 12,
    background: "var(--mb-card)", color: "var(--mb-ink-2)",
    fontFamily: "var(--mb-font-display)", fontSize: 16, fontWeight: 600,
    cursor: "pointer",
  },
  segBtnOn: {
    background: "var(--mb-blue-soft)", borderColor: "var(--mb-blue)",
    color: "var(--mb-blue-ink)", fontWeight: 700,
  },
  footer: {
    flex: "none",
    padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)",
    borderTop: "1px solid var(--mb-line-2)",
  },
  cta: {
    width: "100%", height: 48, border: "none", borderRadius: 999,
    background: "linear-gradient(180deg, var(--mb-accent), var(--mb-accent-2))",
    color: "var(--mb-accent-ink)",
    fontFamily: "var(--mb-font-display)", fontSize: 16, fontWeight: 750,
    cursor: "pointer",
  },
  ctaDisabled: { opacity: 0.45, cursor: "default" },
};
