/**
 * THE FEE CALCULATOR — the published schedule, on any screen, in the gutter.
 *
 * Paul, 2026-08-19: "can you build me a quick easy to use deal commission
 * calculator? For example if the sale price is 7,240,122.34. What is my
 * commission based on the scale." → "make it a quick access button in menu
 * and it can run in the side page gutter on any page im on currently."
 *
 * So: a button in the V2 header opens this as a RIGHT-GUTTER DRAWER over
 * whatever screen is up — Today, Leads, Campaigns — and it stays put across
 * them until closed. The schedule itself is not re-derived here: every number
 * comes from `house/engagement.ts` (`successFee`, `retainerCredit`), which is
 * the ONE definition the engagement letter, the brochure builder and the app
 * all read, and which is tested against the published anchors ($1.8M → $100K
 * floor · $3.46M → $148.4K · $5M → $210K · $10M → $360K). A calculator with
 * its own copy of the bands is how a client gets quoted a number the letter
 * does not say.
 *
 * Two honesty rules carried from the engine: the $100K floor is SHOWN when it
 * binds (not silently applied), and the retainer credit is shown as "at close"
 * with the no-close-no-credit rule stated — the drawer never implies money is
 * owed before a close.
 *
 * Money in: whole dollars, digits only, comma-formatted live as you type so
 * the magnitude is never a guess; converted to integer CENTS before it
 * reaches the engine (house rule 10 — the engine refuses a float). Money out:
 * whole dollars too — the engine keeps cents, the display rounds.
 *
 * Safari rule: the drawer is NOT position:fixed — the V2 shell is a flowing
 * document and the site law forbids fixed full-viewport divs with a
 * background (Safari toolbar tinting). Docked (≥1180) it is `position: sticky`
 * beside <main> in a flex row, which stays in the gutter while you scroll
 * without a fixed element. Below 1180 the row wraps (wrap-reverse, so the
 * panel lands ABOVE the screen, not under a long one) and the panel is
 * position: static — a sticky element on its own wrapped line would float
 * over the content beneath it. `useDocked()` is the one switch.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { C, input, btnPrimary } from "./tokens";
import {
  successFee, retainerCredit, QUARTER_RETAINER_CENTS, FEE_FLOOR_CENTS, FLOOR_BINDS_BELOW_CENTS,
} from "../../../../house/engagement";

/* ── money in / out ─────────────────────────────────────────────────────── */

/** Whole dollars, digits only — "7,233,333" → 723333300 cents. (Paul,
 *  2026-08-19, after typing "7, 23333" and reading $723,333: "just make it a
 *  regular number with commas (no cents) that shows what i am typing so i
 *  dont have to guess decimal place." So no decimals, no K/M shorthand — the
 *  field formats itself with commas as you type, and what you see is the
 *  number.) */
/** 15 digits — $999 trillion. Past 2^53 Number() reshapes the value silently
 *  and the engine would accept the wrong figure; the cap makes that
 *  unreachable by typing. */
export const MAX_DIGITS = 15;
export function parseMoneyToCents(raw: string): number | null {
  const digits = raw.replace(/\D/g, "").slice(0, MAX_DIGITS);
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n * 100;
}
/** Live formatter: keeps only digits, inserts thousands commas. */
export function formatDollarsTyped(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

const money = (cents: number) =>
  Math.round(cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const moneyShort = (cents: number) => {
  const d = cents / 100;
  if (d >= 1e6) return `$${(d / 1e6).toFixed(d % 1e6 === 0 ? 0 : 2)}M`;
  if (d >= 1e3) return `$${(d / 1e3).toFixed(d % 1e3 === 0 ? 0 : 1)}K`;
  return money(cents);
};

/* ── the drawer ─────────────────────────────────────────────────────────── */

/** ≥1180 the drawer docks in the right gutter (sticky); below, it is an
 *  in-flow panel above the screen — position static on purpose, since a
 *  sticky element on its own wrapped line would float over the content
 *  beneath it as you scroll. */
export function useDocked(): boolean {
  const [docked, setDocked] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1180px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1180px)");
    const on = () => setDocked(mq.matches);
    // Both, on purpose: `change` is the right event, but a viewport that is
    // resized by device emulation (DevTools, a driven browser) may re-layout
    // without firing it — observed 2026-08-19. `resize` always fires; the
    // handler reads `mq.matches` either way, so double delivery is harmless.
    mq.addEventListener("change", on);
    window.addEventListener("resize", on);
    return () => { mq.removeEventListener("change", on); window.removeEventListener("resize", on); };
  }, []);
  return docked;
}

export default function FeeCalc({ onClose, docked, focusOnOpen = true }: { onClose: () => void; docked: boolean; focusOnOpen?: boolean }) {
  const [evText, setEvText] = useState("");
  const [quarters, setQuarters] = useState(1);
  const [closed, setClosed] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  // Focus the field when the user OPENS the drawer — not when a reload
  // restores it, which would steal focus from whatever they came back to do.
  useEffect(() => { if (focusOnOpen) inputRef.current?.focus(); }, [focusOnOpen]);

  // CARET PRESERVATION. The field is controlled and re-formatted on every
  // keystroke; when the formatted string differs from what the DOM holds
  // (commas re-seated after a mid-string edit) React re-assigns value and
  // the browser throws the caret to the end — so correcting a typo in the
  // middle typed into the wrong place. The fix: remember how many DIGITS sat
  // left of the caret before the change, then after render put the caret
  // after that many digits in the new string.
  const caretDigits = useRef<number | null>(null);
  const onChangeEv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const left = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, "").length;
    caretDigits.current = left;
    setEvText(formatDollarsTyped(el.value));
  };
  useLayoutEffect(() => {
    const el = inputRef.current, want = caretDigits.current;
    if (!el || want == null) return;
    let pos = 0, seen = 0;
    while (pos < el.value.length && seen < want) { if (/\d/.test(el.value[pos])) seen++; pos++; }
    el.setSelectionRange(pos, pos);
    caretDigits.current = null;
  }, [evText]);

  const evCents = useMemo(() => parseMoneyToCents(evText), [evText]);
  const fee = useMemo(() => (evCents == null ? null : successFee(evCents)), [evCents]);
  const retainerPaid = quarters * QUARTER_RETAINER_CENTS;
  const credit = useMemo(
    () => (fee && fee.ok ? retainerCredit({ retainerPaidCents: retainerPaid, feeCents: fee.fee.feeCents, closed }) : null),
    [fee, retainerPaid, closed],
  );

  return (
    <aside
      aria-label="Fee calculator"
      style={{
        ...(docked
          ? { width: 340, flex: "none", alignSelf: "flex-start", position: "sticky" as const, top: 16, order: 1,
              // taller than the viewport, the sticky panel's bottom would be unreachable until the page ends
              maxHeight: "calc(100vh - 32px)", overflowY: "auto" as const }
          : { flex: "1 1 100%", maxWidth: 560, position: "static" as const, order: -1 }),
        border: `1px solid ${C.hair}`, background: C.bg,
        fontFamily: C.sans, color: C.ink,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.hair}` }}>
        <span style={{ fontFamily: C.display, fontSize: 18, fontWeight: 600 }}>Fee calculator</span>
        <span style={{ fontFamily: C.mono, fontSize: 11.5, color: C.muted, letterSpacing: "0.06em" }}>THE SCHEDULE</span>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={onClose} aria-label="Close"
                style={{ font: "inherit", fontSize: 18, lineHeight: 1, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}>
          ×
        </button>
      </div>

      <div style={{ padding: "14px 14px 16px", display: "grid", gap: 14 }}>
        {/* 1 · enterprise value */}
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Sale price / enterprise value</span>
          <input
            ref={inputRef}
            value={evText}
            onChange={onChangeEv}
            placeholder="7,240,122"
            inputMode="numeric"
            style={{ ...input, fontFamily: C.mono, fontSize: 16, padding: "10px 12px" }}
          />
          {evText && evCents == null && (
            <span style={{ fontSize: 12.5, color: C.muted }}>A sale price above zero.</span>
          )}
        </label>

        {/* 2 · the answer */}
        {fee && fee.ok && (
          <div style={{ background: C.panel, padding: "12px 14px" }}>
            <div style={{ fontFamily: C.mono, fontSize: 11.5, color: C.muted, letterSpacing: "0.08em" }}>SUCCESS FEE</div>
            <div style={{ fontFamily: C.display, fontSize: 34, fontWeight: 600, lineHeight: 1.1, marginTop: 2, color: C.green, fontVariantNumeric: "tabular-nums" }}>
              {money(fee.fee.feeCents)}
            </div>
            <div style={{ fontSize: 12.5, color: C.body, marginTop: 4 }}>
              on {money(evCents!)}
              {fee.fee.floorApplied
                ? <> · <b style={{ color: C.ink }}>the {moneyShort(FEE_FLOOR_CENTS)} minimum applies</b> (banded total {money(fee.fee.bandedTotalCents)}; the floor binds below {moneyShort(FLOOR_BINDS_BELOW_CENTS)})</>
                : <> · {(fee.fee.feeCents / evCents! * 100).toFixed(2)}% blended</>}
            </div>
          </div>
        )}
        {fee && !fee.ok && (
          <div style={{ fontSize: 13, color: C.danger, lineHeight: 1.5 }}>{fee.why}</div>
        )}

        {/* 3 · the bands, each dollar priced in its own band */}
        {fee && fee.ok && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.06em", color: C.muted, textAlign: "left" }}>
                <th style={{ fontWeight: 500, padding: "0 0 6px" }}>BAND</th>
                <th style={{ fontWeight: 500, padding: "0 0 6px", textAlign: "right" }}>APPLIED TO</th>
                <th style={{ fontWeight: 500, padding: "0 0 6px", textAlign: "right" }}>FEE</th>
              </tr>
            </thead>
            <tbody>
              {fee.fee.lines.map(l => (
                <tr key={l.band} style={{ borderTop: `1px solid ${C.hair}` }}>
                  <td style={{ padding: "7px 0", color: C.body }}>{l.band}</td>
                  <td style={{ padding: "7px 0", textAlign: "right", fontFamily: C.mono, fontSize: 12.5, color: C.body }}>{money(l.appliedToCents)}</td>
                  <td style={{ padding: "7px 0", textAlign: "right", fontFamily: C.mono, fontSize: 12.5, color: C.ink, fontWeight: 600 }}>{money(l.feeCents)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `1px solid ${C.chipBd}` }}>
                <td style={{ padding: "7px 0", fontWeight: 700 }}>{fee.fee.floorApplied ? "Banded total" : "Total"}</td>
                <td />
                <td style={{ padding: "7px 0", textAlign: "right", fontFamily: C.mono, fontSize: 12.5, fontWeight: 700 }}>{money(fee.fee.bandedTotalCents)}</td>
              </tr>
              {fee.fee.floorApplied && (
                <tr>
                  <td style={{ padding: "2px 0 7px", fontWeight: 700, color: C.green }}>Minimum fee</td>
                  <td />
                  <td style={{ padding: "2px 0 7px", textAlign: "right", fontFamily: C.mono, fontSize: 12.5, fontWeight: 700, color: C.green }}>{money(FEE_FLOOR_CENTS)}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 4 · the retainer, credited at close */}
        {fee && fee.ok && credit && credit.ok && (
          <div style={{ borderTop: `1px solid ${C.hair}`, paddingTop: 12, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Retainer paid</span>
              <div style={{ display: "inline-flex", border: `1px solid ${C.chipBd}`, borderRadius: 6, overflow: "hidden" }}>
                <button type="button" onClick={() => setQuarters(q => Math.max(0, q - 1))} aria-label="One quarter fewer"
                        style={{ font: "inherit", fontSize: 15, width: 28, height: 28, background: C.bg, border: "none", cursor: "pointer", color: C.body }}>−</button>
                <span style={{ fontFamily: C.mono, fontSize: 12.5, minWidth: 84, textAlign: "center", lineHeight: "28px", borderLeft: `1px solid ${C.chipBd}`, borderRight: `1px solid ${C.chipBd}` }}>
                  {quarters} qtr{quarters === 1 ? "" : "s"} · {moneyShort(retainerPaid)}
                </span>
                <button type="button" onClick={() => setQuarters(q => q + 1)} aria-label="One quarter more"
                        style={{ font: "inherit", fontSize: 15, width: 28, height: 28, background: C.bg, border: "none", cursor: "pointer", color: C.body }}>+</button>
              </div>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.body, marginLeft: "auto" }}>
                <input type="checkbox" checked={closed} onChange={e => setClosed(e.target.checked)} /> closed
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 4, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: C.body }}>{closed ? "Credit against the fee" : "Credit today (no close yet)"}</span>
              <span style={{ fontFamily: C.mono, fontSize: 12.5, textAlign: "right" }}>{money(credit.credit.creditCents)}</span>
              <span style={{ fontWeight: 700 }}>{closed ? "Due at close" : "Fee if it closes (before any credit)"}</span>
              <span style={{ fontFamily: C.mono, fontSize: 13, fontWeight: 700, textAlign: "right" }}>{money(credit.credit.dueAtCloseCents)}</span>
              {credit.credit.excessForfeitedCents > 0 && (
                <>
                  <span style={{ color: C.muted }}>Retainer beyond the fee (not refunded)</span>
                  <span style={{ fontFamily: C.mono, fontSize: 12.5, textAlign: "right", color: C.muted }}>{money(credit.credit.excessForfeitedCents)}</span>
                </>
              )}
            </div>
            {!closed && (
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>No close, no credit — retainers are earned as the work runs. If this deal closes at the fee shown, the {moneyShort(retainerPaid)} paid to date credits then (capped at the fee) and {money(Math.max(0, (fee && fee.ok ? fee.fee.feeCents : 0) - retainerPaid))} is due.</div>
            )}
          </div>
        )}

        {/* 5 · the schedule, for when the number is questioned */}
        <details style={{ fontSize: 12.5, color: C.body, lineHeight: 1.55 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, color: C.ink }}>The schedule</summary>
          <div style={{ marginTop: 6 }}>
            5% of the first $1M · 4% of $1–5M · 3% of $5–10M · 2% above $10M · {moneyShort(FEE_FLOOR_CENTS)} minimum.
            Each dollar is priced in its own band — no cliffs. Retainer {moneyShort(QUARTER_RETAINER_CENTS)} a quarter, up front; every
            retainer dollar credits against the success fee at close; credit caps at the fee; no close, no credit.
            One schedule, every client. Same arithmetic as the engagement letter (<code style={{ fontFamily: C.mono, fontSize: 11.5 }}>house/engagement.ts</code>).
          </div>
        </details>
      </div>
    </aside>
  );
}

/** The header button's label — exported so the shell and any future mobile chrome say the same word. */
export const FEE_CALC_LABEL = "Fee calc";

/* A last-resort export so a screen can embed the primary button without the drawer wiring. */
export const feeBtnStyle = { ...btnPrimary, padding: "6px 12px", fontSize: 13 } as const;
