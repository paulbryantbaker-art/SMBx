/**
 * iosKit — native-iOS UIKit primitives for the Atlas-mobile shell.
 *
 * Borrowed from Apple's iOS component set (the Xcode "List / Action Sheet /
 * Toolbar" kits) so the app reads like a system app: the inset grouped list and
 * its row accessories, the 51×31 switch, the −/+ stepper, the action sheet
 * (with a red destructive action), and the contextual bottom toolbar.
 *
 * All visuals use the shared T tokens + the system font + the app's glass
 * material (M.glassSheet), so these slot into the existing surfaces. Modals
 * (ActionSheet) mount ONLY while open and are bottom-anchored — never a
 * persistent full-viewport fixed bg div (Safari toolbar rule, CLAUDE.md #5).
 */
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { T } from "../desktop/atlasTokens";
import { M } from "./mobileTokens";
import { RT } from "./redesign/rt";
import { ChevronRightIcon } from "../desktop/icons";

/* iOS system colors used as recognizable signals (kept local — not app tokens). */
const IOS_GREEN = "#34C759"; // switch "on"
const IOS_RED = "#FF3B30"; // destructive action

/* ─────────────────────────── Switch (51×31) ─────────────────────────── */

export function Switch({
  on,
  onChange,
  disabled = false,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      style={{
        width: 51,
        height: 31,
        flex: "none",
        borderRadius: 999,
        border: "none",
        padding: 0,
        position: "relative",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        background: on ? IOS_GREEN : "#e3e3ea",
        transition: "background .2s ease",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 1px rgba(0,0,0,.06), 0 3px 8px rgba(0,0,0,.15)",
          transition: "left .2s cubic-bezier(.4,.2,.2,1)",
        }}
      />
    </button>
  );
}

/* ─────────────────────────── Stepper (− +) ──────────────────────────── */

export function Stepper({
  onDec,
  onInc,
  disabledDec = false,
  disabledInc = false,
}: {
  onDec: () => void;
  onInc: () => void;
  disabledDec?: boolean;
  disabledInc?: boolean;
}) {
  return (
    <span style={S.stepper}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabledDec}
        onClick={onDec}
        style={{ ...S.stepperBtn, opacity: disabledDec ? 0.35 : 1 }}
      >
        −
      </button>
      <span style={S.stepperDiv} aria-hidden="true" />
      <button
        type="button"
        aria-label="Increase"
        disabled={disabledInc}
        onClick={onInc}
        style={{ ...S.stepperBtn, opacity: disabledInc ? 0.35 : 1 }}
      >
        +
      </button>
    </span>
  );
}

/* ─────────────── Trailing accessories (compose into ListRow) ─────────── */

/** Grey rounded value pill, e.g. "June 2024" / "9:41 AM". */
export function ValueBadge({ children }: { children: ReactNode }) {
  return <span style={S.valueBadge}>{children}</span>;
}

/** Inline tinted text button inside a row (the reference "Button"). */
export function RowButton({
  children,
  onClick,
  tint = RT.accentInk,
}: {
  children: ReactNode;
  onClick?: () => void;
  tint?: string;
}) {
  return (
    <button type="button" onClick={onClick} style={{ ...S.rowButton, color: tint }}>
      {children}
    </button>
  );
}

/** Pop-up menu indicator (the reference "Pop-up ⌄"). */
export function PopUpValue({ children }: { children: ReactNode }) {
  return (
    <span style={S.popUp}>
      <span>{children}</span>
      <svg width="11" height="14" viewBox="0 0 11 14" fill="none" aria-hidden="true">
        <path d="M3 5.5L5.5 3l2.5 2.5M3 8.5l2.5 2.5 2.5-2.5" stroke={T.muted2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Drag-to-reorder handle (the reference ≡). */
export function ReorderHandle() {
  return (
    <span aria-hidden="true" style={S.reorder}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 6h12M3 9h12M3 12h12" stroke={T.muted2} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ─────────────────────────── ListRow ───────────────────────────────── */

export interface ListRowProps {
  /** Leading icon (~24px) or thumbnail. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Trailing muted detail text (before any accessory). */
  detail?: ReactNode;
  /** Custom trailing control (Switch / Stepper / RowButton / ValueBadge / …). */
  trailing?: ReactNode;
  /** Disclosure chevron on the right. */
  accessory?: "chevron" | "none";
  /** Title color override — e.g. RT.accentInk for an action row, IOS_RED via `destructive`. */
  tint?: string;
  destructive?: boolean;
  onClick?: () => void;
  /** Injected by ListSection — first row draws no top divider. */
  __first?: boolean;
}

export function ListRow({
  leading,
  title,
  subtitle,
  detail,
  trailing,
  accessory = "none",
  tint,
  destructive = false,
  onClick,
  __first = false,
}: ListRowProps) {
  const titleColor = destructive ? IOS_RED : tint ?? T.ink;
  // Divider insets to align with the title (past the leading), iOS-style.
  const dividerInset = 16 + (leading ? 44 : 0);
  // A tappable row is a div with role=button (NOT a <button>) so it can hold
  // interactive trailing controls — a "⋯", a switch — without invalid nesting.
  const tapProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};
  return (
    <div
      {...tapProps}
      style={{ ...S.row, ...(onClick ? S.rowTappable : null) }}
    >
      {!__first && <span aria-hidden="true" style={{ ...S.rowDivider, left: dividerInset }} />}
      {leading != null && <span style={S.rowLeading}>{leading}</span>}
      <span style={S.rowTextWrap}>
        <span style={{ ...S.rowTitle, color: titleColor }}>{title}</span>
        {subtitle != null && <span style={S.rowSubtitle}>{subtitle}</span>}
      </span>
      {detail != null && <span style={S.rowDetail}>{detail}</span>}
      {trailing}
      {accessory === "chevron" && <ChevronRightIcon size={18} c={T.muted2} />}
    </div>
  );
}

/* ─────────────────────────── ListSection ───────────────────────────── */

export function ListSection({
  header,
  headerAction,
  footer,
  children,
  style,
}: {
  /** Section title above the card (iOS grouped header). */
  header?: ReactNode;
  /** Trailing tinted action link on the header row (the reference "Action"). */
  headerAction?: { label: ReactNode; onClick: () => void };
  /** Centered tinted action OR muted text below the card. */
  footer?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const rows = Children.toArray(children).filter(isValidElement) as ReactElement<ListRowProps>[];
  return (
    <section style={{ ...S.section, ...style }}>
      {(header != null || headerAction) && (
        <div style={S.sectionHeader}>
          <span style={S.sectionHeaderTitle}>{header}</span>
          {headerAction && (
            <button type="button" onClick={headerAction.onClick} style={S.sectionHeaderAction}>
              {headerAction.label}
            </button>
          )}
        </div>
      )}
      <div style={S.sectionCard}>
        {rows.map((row, i) => cloneElement(row, { key: row.key ?? i, __first: i === 0 }))}
      </div>
      {footer != null && <div style={S.sectionFooter}>{footer}</div>}
    </section>
  );
}

/* ─────────────────────────── ActionSheet ───────────────────────────── */

export interface SheetAction {
  label: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function ActionSheet({
  open,
  onClose,
  title,
  message,
  actions,
  cancelLabel = "Cancel",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  message?: ReactNode;
  actions: SheetAction[];
  cancelLabel?: ReactNode;
}) {
  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={S.sheetScrim} aria-hidden="true" />
      <div role="dialog" aria-modal="true" style={S.sheetWrap}>
        <div style={S.sheetGroup}>
          {(title != null || message != null) && (
            <div style={S.sheetHeader}>
              {title != null && <div style={S.sheetTitle}>{title}</div>}
              {message != null && <div style={S.sheetMessage}>{message}</div>}
            </div>
          )}
          {actions.map((a, i) => (
            <button
              key={i}
              type="button"
              disabled={a.disabled}
              onClick={() => {
                if (a.disabled) return;
                a.onClick();
                onClose();
              }}
              style={{
                ...S.sheetAction,
                color: a.destructive ? IOS_RED : RT.accentInk,
                opacity: a.disabled ? 0.4 : 1,
                borderTop: i === 0 && title == null && message == null ? "none" : `1px solid ${S_SHEET_DIV}`,
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} style={S.sheetCancel}>
          {cancelLabel}
        </button>
      </div>
    </>
  );
}

/* ─────────────────────────── Toolbar (contextual) ───────────────────── */

export function Toolbar({
  leading,
  center,
  trailing,
}: {
  leading?: { label: ReactNode; onClick: () => void; destructive?: boolean };
  center?: ReactNode;
  trailing?: { label: ReactNode; onClick: () => void; primary?: boolean };
}) {
  return (
    <div style={S.toolbar}>
      {leading ? (
        <button
          type="button"
          onClick={leading.onClick}
          style={{ ...S.toolbarBtn, color: leading.destructive ? IOS_RED : RT.ink2, textAlign: "left" }}
        >
          {leading.label}
        </button>
      ) : (
        <span style={S.toolbarSpacer} />
      )}
      <span style={S.toolbarCenter}>{center}</span>
      {trailing ? (
        <button
          type="button"
          onClick={trailing.onClick}
          style={{ ...S.toolbarBtn, color: RT.accentInk, fontWeight: trailing.primary ? 700 : 500, textAlign: "right" }}
        >
          {trailing.label}
        </button>
      ) : (
        <span style={S.toolbarSpacer} />
      )}
    </div>
  );
}

/* ─────────────────────────── styles ────────────────────────────────── */

const S_SHEET_DIV = "rgba(60,60,67,.18)";

const S: Record<string, CSSProperties> = {
  /* stepper */
  stepper: {
    display: "inline-flex",
    alignItems: "center",
    background: T.track,
    borderRadius: 8,
    height: 32,
    flex: "none",
  },
  stepperBtn: {
    width: 44,
    height: 32,
    border: "none",
    background: "transparent",
    color: T.ink,
    fontSize: 20,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: T.font,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitTapHighlightColor: "transparent",
  },
  stepperDiv: { width: 1, height: 18, background: T.inputBd, flex: "none" },

  /* trailing accessories */
  valueBadge: {
    flex: "none",
    background: T.track,
    color: T.muted,
    fontSize: 15,
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: 7,
    fontVariantNumeric: "tabular-nums",
  },
  rowButton: {
    flex: "none",
    border: "none",
    background: "transparent",
    fontSize: 17,
    fontWeight: 500,
    cursor: "pointer",
    padding: 0,
    fontFamily: T.font,
    WebkitTapHighlightColor: "transparent",
  },
  popUp: {
    flex: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    color: T.muted,
    fontSize: 17,
  },
  reorder: { flex: "none", display: "inline-flex", alignItems: "center" },

  /* list section */
  section: { display: "flex", flexDirection: "column" },
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    padding: "0 4px 7px",
    gap: 12,
  },
  sectionHeaderTitle: { fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em" },
  sectionHeaderAction: {
    border: "none",
    background: "transparent",
    color: RT.accentInk,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    fontFamily: T.font,
    WebkitTapHighlightColor: "transparent",
  },
  sectionCard: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: T.rCardLg,
    boxShadow: T.shCard,
    overflow: "hidden",
  },
  sectionFooter: { padding: "8px 4px 0", fontSize: 13.5, lineHeight: 1.45, color: T.muted },

  /* list row */
  row: {
    position: "relative",
    width: "100%",
    minHeight: 48,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 16px",
    background: T.white,
    border: "none",
    textAlign: "left",
    fontFamily: T.font,
    color: T.ink,
  },
  rowTappable: { cursor: "pointer", WebkitTapHighlightColor: "transparent" },
  rowDivider: { position: "absolute", top: 0, right: 0, height: 1, background: T.rowDiv },
  rowLeading: { flex: "none", width: 32, display: "flex", alignItems: "center", justifyContent: "center" },
  rowTextWrap: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  rowTitle: { fontSize: 17, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis" },
  rowSubtitle: { fontSize: 14, color: T.muted, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis" },
  rowDetail: { flex: "none", fontSize: 17, color: T.muted, maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  /* action sheet */
  sheetScrim: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.4)",
    zIndex: 40,
    animation: "atlas-mobile-scrim-in .18s ease-out",
  },
  sheetWrap: {
    position: "fixed",
    left: 8,
    right: 8,
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
    zIndex: 41,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    animation: "atlas-mobile-sheet-up .26s cubic-bezier(.32,.72,0,1)",
  },
  sheetGroup: {
    borderRadius: 14,
    overflow: "hidden",
    background: "rgba(255,255,255,.86)",
    backdropFilter: "blur(28px) saturate(1.8)",
    WebkitBackdropFilter: "blur(28px) saturate(1.8)",
  },
  sheetHeader: {
    padding: "16px 16px 14px",
    textAlign: "center",
    borderBottom: `1px solid ${S_SHEET_DIV}`,
  },
  sheetTitle: { fontSize: 14, fontWeight: 600, color: T.ink },
  sheetMessage: { marginTop: 3, fontSize: 13, lineHeight: 1.4, color: T.muted },
  sheetAction: {
    width: "100%",
    minHeight: 57,
    border: "none",
    background: "transparent",
    fontSize: 19,
    fontWeight: 400,
    cursor: "pointer",
    fontFamily: T.font,
    WebkitTapHighlightColor: "transparent",
  },
  sheetCancel: {
    width: "100%",
    minHeight: 57,
    border: "none",
    borderRadius: 14,
    background: "rgba(255,255,255,.96)",
    backdropFilter: "blur(28px) saturate(1.8)",
    WebkitBackdropFilter: "blur(28px) saturate(1.8)",
    color: RT.accentInk,
    fontSize: 19,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: T.font,
    WebkitTapHighlightColor: "transparent",
  },

  /* toolbar */
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 18px calc(env(safe-area-inset-bottom, 0px) + 10px)",
    background: M.glassNav.fallbackBg,
    backdropFilter: M.glassNav.backdropFilter,
    WebkitBackdropFilter: M.glassNav.backdropFilter,
    borderTop: `1px solid ${T.railDiv}`,
  },
  toolbarBtn: {
    border: "none",
    background: "transparent",
    fontSize: 17,
    cursor: "pointer",
    padding: 0,
    fontFamily: T.font,
    flex: "none",
    WebkitTapHighlightColor: "transparent",
  },
  toolbarCenter: { flex: 1, minWidth: 0, textAlign: "center", fontSize: 15, color: T.muted },
  toolbarSpacer: { flex: "none", width: 40 },
};
