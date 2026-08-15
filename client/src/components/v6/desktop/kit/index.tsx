/**
 * THE KIT — the app's result-scanning grammar, in one file.
 *
 * Paul, 2026-08-15, with four thetrainline.com screenshots: *"Let's plan the
 * redesign around this and drop atlas."* The plan is `APP_REDESIGN_TRAINLINE.md`;
 * this is its Phase 0.
 *
 * ── WHAT WE TOOK, AND WHY ────────────────────────────────────────────────
 * Not their look — their GRAMMAR. Atlas presents records: here is a table,
 * click a row. Trainline presents a decision: here are the options, here is
 * the number separating them, here is the one we would pick AND WHY, and here
 * is what you cannot have. The second is what a practitioner needs at a board,
 * and it is the thing this app has never had.
 *
 * Every primitive here exists to make a COMPARISON legible without opening
 * anything. Four of them exist specifically to make an ABSENCE legible, which
 * is the same job the citation law does in `house/audit.ts`: a figure that is
 * missing must look missing, never like a zero and never like nothing.
 *
 * ── THE SKIN IS CARTA ────────────────────────────────────────────────────
 * None of Trainline's colour survives. Deal Green is the one accent (`T.blue`
 * — historical slot name, see atlasTokens.ts), radius 0 except buttons and
 * inputs, flat near-black for dark cards, cool hairlines. Where the reference
 * uses indigo, we use green; where it uses a yellow badge, we use a green tint.
 *
 * ── PRESENTATION ONLY ────────────────────────────────────────────────────
 * Nothing here decides anything. Counts, orderings, endorsements and their
 * grounds all arrive as props from a screen that got them from `house/`. A
 * primitive that computed a number would be a second place the number lives,
 * which is the drift this practice has spent weeks removing.
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "../atlasTokens";

/* ═══ P1 · THE CRITERIA BAR ══════════════════════════════════════════════
 * One horizontal strip of segmented cells with hairline dividers, stating
 * what you are looking at, above everything else. Editable in place — the
 * reference has no settings screen and no modal, and neither do we.
 *
 * Cells are flexible-width by default so a long client name is not clipped;
 * pass `grow: 0` for a cell whose content is a fixed shape (a date, a count).
 */

export interface CriteriaCell {
  /** Small label above the value — "Out", "Run for". */
  label: string;
  /** The value itself. A string renders as text; a node renders as given. */
  value: ReactNode;
  onClick?: () => void;
  grow?: number;
}

export function CriteriaBar({ cells, onSearch, searchLabel = "Search" }: {
  cells: CriteriaCell[];
  onSearch?: () => void;
  searchLabel?: string;
}) {
  return (
    <div style={criteriaWrap}>
      {cells.map((c, i) => (
        <button
          key={i}
          type="button"
          onClick={c.onClick}
          disabled={!c.onClick}
          style={{
            ...criteriaCell,
            flex: `${c.grow ?? 1} 1 0`,
            borderLeft: i === 0 ? "none" : `1px solid ${T.border}`,
            cursor: c.onClick ? "pointer" : "default",
          }}
        >
          <span style={criteriaLabel}>{c.label}</span>
          <span style={criteriaValue}>{c.value}</span>
        </button>
      ))}
      {onSearch && (
        <button type="button" onClick={onSearch} style={criteriaSearch} aria-label={searchLabel}>
          <SearchGlyph />
        </button>
      )}
    </div>
  );
}

/* ═══ P2 · THE CHIP ROW — AND CHIPS CARRY NUMBERS ════════════════════════
 * THE DETAIL THAT MATTERS: the reference's first chip reads "Train · $104.88",
 * not "Train". It tells you the cheapest train BEFORE you click it. A chip
 * that only names a filter makes you click to find out what is behind it; a
 * chip that carries its consequence lets you decide not to bother.
 *
 * This is the highest-value pattern in the whole reference and it costs us
 * nothing — the counts are already computed for the board.
 *
 * `value` is therefore a first-class field, not an afterthought, and
 * `value: null` renders the chip WITHOUT a number rather than with a zero —
 * "no deals due" and "we have not counted" are different facts.
 */

export interface Chip {
  id: string;
  label: string;
  /** The consequence. `undefined` = this chip has no number; `null` = unknown. */
  value?: string | null;
  kind?: "toggle" | "boolean" | "dropdown";
}

export function ChipRow({ chips, activeId, activeIds, onPick, right }: {
  chips: Chip[];
  /** Single-select (a mode). */
  activeId?: string;
  /** Multi-select (booleans). Both may be supplied. */
  activeIds?: Set<string>;
  onPick: (id: string) => void;
  /** Right-aligned slot — the reference puts its compare-strip expander here. */
  right?: ReactNode;
}) {
  return (
    <div style={chipRowWrap}>
      {chips.map(c => {
        const on = activeId === c.id || activeIds?.has(c.id) === true;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            style={{
              ...chipStyle,
              borderColor: on ? T.blue : T.inputBd,
              background: on ? T.blueBg : T.white,
              color: on ? T.blue : T.ink,
              fontWeight: on ? 700 : 500,
            }}
            aria-pressed={on}
          >
            {c.label}
            {c.value !== undefined && (
              <span style={{ ...chipValue, color: on ? T.blue : T.muted }}>
                {c.value === null ? "—" : `· ${c.value}`}
              </span>
            )}
            {c.kind === "dropdown" && <Caret />}
          </button>
        );
      })}
      {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
    </div>
  );
}

/* ═══ P3 · THE COMPARISON STRIP ══════════════════════════════════════════
 * Neighbouring alternatives, each with the deciding number under it, the
 * active one carrying a 3px underline.
 *
 * THE STATE THAT MATTERS IS THE EMPTY ONE. Two of the reference's seven days
 * show a magnifying glass instead of a price — not loaded, and it says so.
 * A blank cell reads as zero and a zero is a lie, so `value: null` renders a
 * visible "not known" mark. `ValuationPanel` got this right first (every
 * method shows its number OR the reason there isn't one); this is that idea
 * extracted so every screen can use it.
 */

export interface CompareItem {
  id: string;
  /** The top line — a stage name, a date, a method. */
  label: string;
  /** The deciding number. `null` = not known, and it will SAY so. */
  value: string | null;
  /** Optional prefix on the value line — the reference uses "from". */
  prefix?: string;
  /** Shown under an unknown value instead of the glyph, when we know why. */
  unknownWhy?: string;
}

export function CompareStrip({ items, activeId, onPick }: {
  items: CompareItem[];
  activeId?: string;
  onPick?: (id: string) => void;
}) {
  return (
    <div style={compareWrap} role="tablist">
      {items.map(it => {
        const on = it.id === activeId;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onPick?.(it.id)}
            title={it.value === null ? it.unknownWhy : undefined}
            style={{
              ...compareCell,
              borderBottom: `3px solid ${on ? T.blue : "transparent"}`,
              cursor: onPick ? "pointer" : "default",
            }}
          >
            <span style={{ ...compareLabel, fontWeight: on ? 700 : 500, color: on ? T.ink : T.muted }}>
              {it.label}
            </span>
            {it.value === null ? (
              <span style={compareUnknown}><SearchGlyph size={13} /></span>
            ) : (
              <span style={compareValue}>
                {it.prefix && <span style={{ color: T.muted2, fontWeight: 400 }}>{it.prefix} </span>}
                {it.value}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══ P4 · LIST / DETAIL ═════════════════════════════════════════════════
 * ~58/42, both scrolling independently, detail sticky, nothing modal.
 *
 * This replaces row-expansion, which is what the Deals table does today and
 * is why you lose your place: opening a deal pushes every row below it down
 * the page. A right panel changes one region and leaves the list where it was.
 */

export function ListDetail({ list, detail, detailEmpty }: {
  list: ReactNode;
  detail: ReactNode | null;
  /** Shown when nothing is selected. Say what a selection would give you. */
  detailEmpty?: ReactNode;
}) {
  return (
    <div style={ldWrap}>
      <div style={ldList}>{list}</div>
      <div style={ldDetail}>
        {detail ?? (
          <div style={ldEmpty}>{detailEmpty ?? "Select a row to see its detail."}</div>
        )}
      </div>
    </div>
  );
}

/* ═══ P7 · GROUP HEADER + COLUMN HEADER, ONE ROW ═════════════════════════
 * The reference's "📅 Sat, Aug 15, 2026 │ Standard │ 1st Class" both groups
 * the rows below it and names their columns, repeated per group — so the
 * column labels stay next to the numbers instead of stranded at the top of a
 * long scroll. Saves a row of chrome per group.
 */

export function GroupHeader({ title, columns, icon }: {
  title: string;
  /** Right-aligned column names, in the same order the rows render them. */
  columns?: string[];
  icon?: ReactNode;
}) {
  return (
    <div style={groupHeadWrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        {icon}
        <span style={groupTitle}>{title}</span>
      </div>
      {columns && (
        <div style={{ display: "flex", gap: 0, flex: "none" }}>
          {columns.map(c => <span key={c} style={groupCol}>{c}</span>)}
        </div>
      )}
    </div>
  );
}

/* ═══ P5 · THE ROW ═══════════════════════════════════════════════════════
 * Two big facts as the anchor, one small line of consequence beneath with
 * the interesting part linked, identity in the middle, and the deciding
 * numbers right-aligned in fixed columns matching the group header.
 *
 * UNAVAILABLE PRINTS "Not available". It is never hidden and it never prints
 * a zero — pass `null` in `values` and the cell says so in grey. `Deals.tsx`
 * already carries this instinct in prose ("a literal 0-cents Ask must not
 * print $0 Ask"); here it is structural.
 */

export interface RowValue {
  /** `null` renders the unavailable state. */
  text: string | null;
  /** Emphasised — the reference fills the chosen price as a dark chip. */
  lead?: boolean;
  /** Small badge under the value — the reference's "Cheapest". */
  badge?: string;
  /** Small caution under the value — the reference's "Only 5 left". */
  note?: string;
}

export function ResultRow({
  anchor, sub, subLink, onSubLink, identity, values, selected, onClick, endorsed,
}: {
  /** The two big facts. Rendered as given so a screen can put an arrow in. */
  anchor: ReactNode;
  sub?: ReactNode;
  /** The interesting part of the sub line, rendered underlined. */
  subLink?: string;
  onSubLink?: () => void;
  identity?: ReactNode;
  values: RowValue[];
  selected?: boolean;
  onClick?: () => void;
  /** Wraps the row in the accent border the endorsement band points at. */
  endorsed?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => { if (onClick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick(); } }}
      style={{
        ...rowWrap,
        background: selected ? T.blueBg : T.white,
        border: endorsed ? `1px solid ${T.blue}` : `1px solid transparent`,
        borderBottom: endorsed ? `1px solid ${T.blue}` : `1px solid ${T.border}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={rowAnchor}>{anchor}</div>
        {(sub || subLink) && (
          <div style={rowSub}>
            {sub}
            {subLink && (
              <>
                {sub ? ", " : ""}
                <span
                  onClick={e => { if (onSubLink) { e.stopPropagation(); onSubLink(); } }}
                  style={{ textDecoration: "underline", cursor: onSubLink ? "pointer" : "inherit" }}
                >{subLink}</span>
              </>
            )}
          </div>
        )}
      </div>
      {identity && <div style={rowIdentity}>{identity}</div>}
      <div style={{ display: "flex", flex: "none" }}>
        {values.map((v, i) => (
          <div key={i} style={rowCell}>
            {v.text === null ? (
              <span style={rowUnavailable}>Not available</span>
            ) : v.lead ? (
              <span style={rowLead}>{v.text}</span>
            ) : (
              <span style={rowValue}>{v.text}</span>
            )}
            {v.badge && <span style={rowBadge}>{v.badge}</span>}
            {v.note && <span style={rowNote}>{v.note}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ P6 · THE ENDORSEMENT BAND ══════════════════════════════════════════
 * A tinted band with a notch pointing down at the row it endorses.
 *
 * IT IS A SENTENCE WITH GROUNDS, NOT A BADGE. The reference says "We recommend
 * this journey based on price and duration" — "Recommended" alone would be an
 * opinion; the grounds clause is a claim you can check. That is this practice's
 * citation law rendered as UI, so `grounds` is a REQUIRED prop: there is no
 * way to render this band without saying why.
 */

export function Endorsement({ claim, grounds }: { claim: string; grounds: string }) {
  return (
    <div style={endorseWrap}>
      <span style={{ fontWeight: 700 }}>{claim}</span>{" "}
      <span style={{ color: T.muted }}>{grounds}</span>
      <span style={endorseNotch} aria-hidden />
    </div>
  );
}

/* ═══ P8 · EXPANDERS AT BOTH ENDS ════════════════════════════════════════
 * Full-width rows admitting the list is a window onto something larger.
 * Replaces the pager: better for a board you scan than page numbers.
 */

export function Expander({ dir, label, onClick, disabled }: {
  dir: "up" | "down";
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ ...expanderWrap, opacity: disabled ? 0.45 : 1 }}>
      <Chevron dir={dir} /> {label}
    </button>
  );
}

/* ═══ P9 · THE HONEST FOOTER ═════════════════════════════════════════════
 * The reference closes its results with plain prose: "We show tickets for the
 * fastest available journeys with the smallest number of changes, highlighting
 * the cheapest within these results. Some results may be sponsored."
 *
 * TAKE THIS ONE SERIOUSLY. Every ranked list in this app applies an ordering
 * nobody can see — the board order, the fit score, the screen's tiering. A
 * footer stating the rule is the cheapest honesty win available, and it is the
 * same discipline `revenue_basis` follows in `house/screen.ts`: the number
 * travels with its arithmetic.
 *
 * `ordering` is required. A ranked list with no stated rule should not compile.
 */

export function RankingNote({ title = "How this list is ordered", ordering, caveats }: {
  title?: string;
  ordering: string;
  caveats?: string[];
}) {
  return (
    <div style={rankWrap}>
      <div style={rankTitle}>{title}</div>
      <p style={rankBody}>{ordering}</p>
      {caveats?.map((c, i) => <p key={i} style={rankBody}>{c}</p>)}
    </div>
  );
}

/* ═══ P10 · THE DETAIL PANEL STACK ═══════════════════════════════════════
 * The reference stacks: a dark summary card carrying the headline number and
 * the ONE primary action, then a timeline card, then condition cards. Info
 * banners carry a left colour bar and plain prose.
 *
 * Ours is Carta's flat near-black, not their navy, and the badge is a green
 * tint, not their yellow.
 */

export function SummaryCard({ kicker, value, badge, sub, actionLabel, onAction }: {
  kicker: string;
  value: string;
  badge?: string;
  sub?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div style={sumWrap}>
      <div style={{ minWidth: 0 }}>
        <div style={sumKicker}>{kicker}</div>
        <div style={sumValue}>{value}</div>
        {badge && <span style={sumBadge}>{badge}</span>}
        {sub && <div style={sumSub}>{sub}</div>}
      </div>
      {actionLabel && (
        <button type="button" onClick={onAction} style={sumAction}>
          {actionLabel} <Chevron dir="right" />
        </button>
      )}
    </div>
  );
}

export function InfoBanner({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "caution" }) {
  const accent = tone === "caution" ? T.amber : T.blue;
  const bg = tone === "caution" ? T.amberBg : T.blueBg;
  return (
    <div style={{ ...infoWrap, background: bg, borderLeft: `3px solid ${accent}` }}>{children}</div>
  );
}

export function DetailCard({ title, action, children }: {
  title?: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      {(title || action) && (
        <div style={detailHead}>
          {title && <span style={detailTitle}>{title}</span>}
          {action}
        </div>
      )}
      <div style={detailBody}>{children}</div>
    </div>
  );
}

/**
 * The reference's vertical journey timeline — dot, rule, dot — with the two
 * endpoints and what happened between them. Ours carries gate history.
 */
export function Timeline({ from, to, middle }: {
  from: { time: string; place: string };
  to: { time: string; place: string };
  middle?: ReactNode;
}) {
  return (
    <div style={tlWrap}>
      <div style={tlRail} aria-hidden>
        <span style={tlDot} /><span style={tlLine} /><span style={{ ...tlDot, background: T.ink }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={tlPoint}><b>{from.time}</b> {from.place}</div>
        {middle && <div style={tlMiddle}>{middle}</div>}
        <div style={tlPoint}><b>{to.time}</b> {to.place}</div>
      </div>
    </div>
  );
}

/* ═══ P11 · THE PRICED CHOICE PAIR ═══════════════════════════════════════
 * The reference: "Lowest Price $32.32" │ "Semi-flexible + $3.21".
 *
 * THE ALTERNATIVE IS PRICED AS A DELTA, not as a second absolute. You read the
 * cost of flexibility directly instead of subtracting two numbers. We have
 * nothing like this today and deal structure is exactly where it belongs — the
 * earnout against a higher ask, the seller note against more equity.
 *
 * `delta` is a string so the caller controls the sign and the words: "+ $3.21",
 * "− 40bp", "no change". Computing it here would put arithmetic in the kit.
 */

export interface PricedOption {
  id: string;
  label: string;
  /** The base option shows an absolute; the others show a delta. */
  absolute?: string;
  delta?: string;
  note?: string;
}

export function OptionPair({ options, activeId, onPick }: {
  options: PricedOption[];
  activeId?: string;
  onPick?: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", border: `1px solid ${T.border}` }}>
      {options.map((o, i) => {
        const on = o.id === activeId;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick?.(o.id)}
            style={{
              ...optWrap,
              borderLeft: i === 0 ? "none" : `1px solid ${T.border}`,
              outline: on ? `2px solid ${T.blue}` : "none",
              outlineOffset: -2,
              background: on ? T.blueBg : T.white,
              cursor: onPick ? "pointer" : "default",
            }}
          >
            <span style={optLabel}>{o.label}</span>
            <span style={optValue}>{o.absolute ?? o.delta ?? "—"}</span>
            {o.note && <span style={optNote}>{o.note}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ═══ glyphs ═════════════════════════════════════════════════════════════ */

function SearchGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function Caret() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 3 }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "up" | "down" | "right" }) {
  const d = dir === "up" ? "M6 15l6-6 6 6" : dir === "down" ? "M6 9l6 6 6-6" : "M9 6l6 6-6 6";
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/* ═══ styles ═════════════════════════════════════════════════════════════
 * Radius 0 throughout except buttons and inputs at 10 — Carta's one exception.
 */

const criteriaWrap: CSSProperties = {
  display: "flex", alignItems: "stretch",
  border: `1px solid ${T.border}`, background: T.white,
};
const criteriaCell: CSSProperties = {
  font: "inherit", textAlign: "left", background: "transparent", border: "none",
  padding: "9px 13px", display: "flex", flexDirection: "column", gap: 2, minWidth: 0,
};
const criteriaLabel: CSSProperties = { fontSize: 10.5, color: T.muted2, letterSpacing: ".02em" };
const criteriaValue: CSSProperties = {
  fontSize: 14, fontWeight: 700, color: T.ink,
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};
const criteriaSearch: CSSProperties = {
  flex: "none", width: 52, background: T.track, border: "none",
  borderLeft: `1px solid ${T.border}`, color: T.ink, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const chipRowWrap: CSSProperties = {
  display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 12,
};
const chipStyle: CSSProperties = {
  font: "inherit", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 2,
  padding: "6px 12px", borderRadius: 10, border: "1px solid", cursor: "pointer",
};
const chipValue: CSSProperties = { fontWeight: 500, marginLeft: 3 };

const compareWrap: CSSProperties = {
  display: "flex", alignItems: "stretch", marginTop: 14,
  borderBottom: `1px solid ${T.border}`, overflowX: "auto",
};
const compareCell: CSSProperties = {
  font: "inherit", background: "transparent", border: "none", flex: "1 1 0",
  padding: "8px 10px 9px", display: "flex", flexDirection: "column", gap: 3,
  alignItems: "center", minWidth: 92, marginBottom: -1,
};
const compareLabel: CSSProperties = { fontSize: 12.5, whiteSpace: "nowrap" };
const compareValue: CSSProperties = {
  fontSize: 13, fontWeight: 700, color: T.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
};
const compareUnknown: CSSProperties = { color: T.muted2, display: "flex", alignItems: "center", height: 17 };

const ldWrap: CSSProperties = { display: "flex", gap: 18, alignItems: "flex-start", minHeight: 0 };
const ldList: CSSProperties = { flex: "1.38 1 0", minWidth: 0 };
const ldDetail: CSSProperties = { flex: "1 1 0", minWidth: 0, position: "sticky", top: 12 };
const ldEmpty: CSSProperties = {
  padding: "22px 18px", border: `1px solid ${T.border}`, background: T.white,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};

const groupHeadWrap: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "8px 12px", background: T.track,
  borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
};
const groupTitle: CSSProperties = { fontSize: 12.5, fontWeight: 700, color: T.ink };
const groupCol: CSSProperties = {
  fontSize: 11, fontWeight: 700, color: T.muted2, width: 104, textAlign: "right",
};

const rowWrap: CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
};
const rowAnchor: CSSProperties = {
  fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: "-0.005em",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};
const rowSub: CSSProperties = { fontSize: 11.5, color: T.muted, marginTop: 2 };
const rowIdentity: CSSProperties = { flex: "none", display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" };
const rowCell: CSSProperties = {
  width: 104, flex: "none", display: "flex", flexDirection: "column",
  alignItems: "flex-end", gap: 2,
};
const rowValue: CSSProperties = { fontSize: 13, color: T.ink, fontVariantNumeric: "tabular-nums" };
const rowLead: CSSProperties = {
  fontSize: 13, fontWeight: 700, color: T.white, background: T.ink,
  padding: "4px 8px", fontVariantNumeric: "tabular-nums",
};
const rowUnavailable: CSSProperties = { fontSize: 12, color: T.muted2 };
const rowBadge: CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
  background: T.blueBg, color: T.blue, padding: "1px 5px",
};
const rowNote: CSSProperties = { fontSize: 10.5, color: T.amber };

const endorseWrap: CSSProperties = {
  position: "relative", padding: "8px 12px", background: T.blueBg,
  borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.ink, lineHeight: 1.5,
};
/* The notch. A rotated square hanging off the bottom edge, so the band points
   at the row it endorses rather than merely sitting above it. */
const endorseNotch: CSSProperties = {
  position: "absolute", left: 26, bottom: -5, width: 10, height: 10,
  background: T.blueBg, transform: "rotate(45deg)",
};

const expanderWrap: CSSProperties = {
  font: "inherit", fontSize: 12.5, fontWeight: 600, color: T.ink,
  width: "100%", padding: "10px 0", background: T.white,
  border: `1px solid ${T.border}`, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
};

const rankWrap: CSSProperties = { marginTop: 20, maxWidth: 640 };
const rankTitle: CSSProperties = { fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 5 };
const rankBody: CSSProperties = { margin: "0 0 6px", fontSize: 12, color: T.muted, lineHeight: 1.6 };

const sumWrap: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
  padding: "15px 16px", background: "#181818", color: T.white,
};
const sumKicker: CSSProperties = { fontSize: 11.5, color: "#B9BDBF" };
const sumValue: CSSProperties = { fontSize: 27, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 1 };
const sumBadge: CSSProperties = {
  display: "inline-block", marginTop: 5, fontSize: 9.5, fontWeight: 700,
  letterSpacing: ".05em", textTransform: "uppercase",
  background: "#A8F0CE", color: "#0A3D2C", padding: "2px 6px",
};
const sumSub: CSSProperties = { fontSize: 11.5, color: "#B9BDBF", marginTop: 5 };
const sumAction: CSSProperties = {
  font: "inherit", fontSize: 13.5, fontWeight: 700, color: T.white,
  background: T.blue, border: "none", borderRadius: 10, padding: "11px 16px",
  cursor: "pointer", flex: "none", display: "inline-flex", alignItems: "center", gap: 6,
};

const infoWrap: CSSProperties = { padding: "10px 13px", fontSize: 12, color: T.ink, lineHeight: 1.55 };

const detailHead: CSSProperties = {
  display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 7,
};
const detailTitle: CSSProperties = { fontSize: 15, fontWeight: 700, color: T.ink };
const detailBody: CSSProperties = { border: `1px solid ${T.border}`, background: T.white, padding: "13px 14px" };

const tlWrap: CSSProperties = { display: "flex", gap: 11 };
const tlRail: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 5, flex: "none" };
const tlDot: CSSProperties = { width: 7, height: 7, borderRadius: 999, background: T.muted2, flex: "none" };
const tlLine: CSSProperties = { width: 1, flex: 1, minHeight: 26, background: T.border };
const tlPoint: CSSProperties = { fontSize: 12.5, color: T.ink };
const tlMiddle: CSSProperties = { fontSize: 11.5, color: T.muted, padding: "7px 0" };

const optWrap: CSSProperties = {
  font: "inherit", flex: "1 1 0", padding: "10px 12px", background: T.white,
  border: "none", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
};
const optLabel: CSSProperties = { fontSize: 12, fontWeight: 700, color: T.ink };
const optValue: CSSProperties = { fontSize: 13.5, color: T.ink, fontVariantNumeric: "tabular-nums" };
const optNote: CSSProperties = { fontSize: 11, color: T.muted };
