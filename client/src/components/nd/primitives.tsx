/* ============================================================================
   primitives.tsx — shared monochrome UI atoms for the agent-first desktop (nd).
   Ported from the Claude-Design handoff (Test 33 / primitives.jsx + chrome.jsx
   atoms). All styling comes from nd.css (.mck-* classes under the .nd-root scope).
   ============================================================================ */
import type { CSSProperties, ReactNode } from "react";

/* ---- Icons — minimal geometric line glyphs (1.6 stroke, 18 viewBox) ---- */
export const ICONS: Record<string, string> = {
  search: "M11 11l4 4 M7.5 13a5.5 5.5 0 100-11 5.5 5.5 0 000 11z",
  plus: "M9 3.5v11 M3.5 9h11",
  send: "M9 14.5V4 M4.5 8.5L9 4l4.5 4.5",
  attach: "M14 8.2l-5.1 5.1a3 3 0 11-4.2-4.2l5.3-5.3a2 2 0 112.8 2.8l-5.3 5.3a1 1 0 11-1.4-1.4l4.9-4.9",
  agent: "M9 2.2l1.7 4.1 4.1 1.7-4.1 1.7L9 15.8l-1.7-4.1L3.2 10l4.1-1.7L9 2.2z",
  chevDown: "M4.5 7l4.5 4.5L13.5 7",
  chevRight: "M7 4.5L11.5 9 7 13.5",
  chevUpDown: "M6 7.5L9 4.5l3 3 M6 10.5l3 3 3-3",
  check: "M3.5 9.5l3.5 3.5 7.5-8",
  more: "M4 9h.01 M9 9h.01 M14 9h.01",
  bell: "M9 2.5a4 4 0 00-4 4c0 4.5-1.5 5.5-1.5 5.5h11s-1.5-1-1.5-5.5a4 4 0 00-4-4z M7.5 14.5a1.6 1.6 0 003 0",
  filter: "M3 5h12 M5 9h8 M7 13h4",
  comment: "M3 4.5h12v8H8l-3 2.5V12.5H3z",
  at: "M9 12a3 3 0 100-6 3 3 0 000 6z M12 9v1.2a2 2 0 003.5 1.3A7 7 0 109 16",
  link: "M7.5 10.5l3-3 M6.5 8.5L5 10a2.5 2.5 0 003.5 3.5l1.5-1.5 M11.5 9.5L13 8a2.5 2.5 0 00-3.5-3.5L8 6",
  target: "M9 15A6 6 0 109 3a6 6 0 000 12z M9 11.5A2.5 2.5 0 109 6.5a2.5 2.5 0 000 5z",
  grid: "M3 3h5v5H3z M10 3h5v5h-5z M3 10h5v5H3z M10 10h5v5h-5z",
  list: "M6 4.5h9 M6 9h9 M6 13.5h9 M3 4.5h.01 M3 9h.01 M3 13.5h.01",
  doc: "M5 2.5h5l3 3v10H5z M10 2.5v3h3",
  bars: "M4 14V8 M9 14V4 M14 14v-4",
  arrowRight: "M3.5 9h11 M10.5 5l4 4-4 4",
  arrowUpRight: "M5.5 12.5l7-7 M6.5 5.5h6v6",
  sliders: "M3 6h8 M13 6h2 M3 12h2 M7 12h8 M11 4.5v3 M5 10.5v3",
  clock: "M9 15A6 6 0 109 3a6 6 0 000 12z M9 5.5V9l2.5 1.5",
  spark: "M9 3v3 M9 12v3 M3 9h3 M12 9h3",
  x: "M4.5 4.5l9 9 M13.5 4.5l-9 9",
  expand: "M10.5 3.5H14.5V7.5 M14 4l-4.5 4.5 M7.5 14.5H3.5V10.5 M4 14l4.5-4.5",
  shrink: "M14 4.5l-4 4 M14 8.5h-4v-4 M4 13.5l4-4 M4 9.5h4v4",
  panel: "M2.5 3.5h13v11h-13z M11 3.5v11",
  st_source: "M11 11l3.5 3.5 M7.5 13a5.5 5.5 0 100-11 5.5 5.5 0 000 11z",
  st_analyze: "M4 14V9 M9 14V4 M14 14v-7",
  st_close: "M9 15.5A6.5 6.5 0 109 2.5a6.5 6.5 0 000 13z M6 9l2 2 4-4.5",
  st_post: "M3.5 3.5h7v7h-7z M7.5 7.5h7v7h-7z",
};
export type IcName = keyof typeof ICONS | string;

export function Ic({ name, size = 16, stroke = 1.6, className = "", style }: { name: IcName; size?: number; stroke?: number; className?: string; style?: CSSProperties }) {
  const d = ICONS[name] || ICONS.spark;
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  );
}

/* ---- Logo (smbx.ai) ---- */
export function Logo({ size = 18, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <span className="mck-logo" style={{ gap: size * 0.5 }}>
      <span className="mck-mark" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <rect x="0.6" y="0.6" width="16.8" height="16.8" rx="4.2" fill="var(--ink)" />
          <path d="M5.6 11.4c0 0.9 0.9 1.5 2 1.5 1 0 1.9-0.5 1.9-1.4 0-2-3.7-1.2-3.7-3.2 0-0.9 0.8-1.4 1.8-1.4 1 0 1.8 0.5 1.9 1.3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          <circle cx="12.4" cy="6.2" r="1.15" fill="var(--accent)" />
        </svg>
      </span>
      {showText && <span className="mck-wordmark" style={{ fontSize: size * 0.82 }}>smbx<span style={{ color: "var(--ink-3)" }}>.ai</span></span>}
    </span>
  );
}

/* ---- YuliaMark — the agent identity badge (accent square + sparkle) ---- */
export function YuliaMark({ size = 27, radius }: { size?: number; radius?: number }) {
  return (
    <span className="mck-agent-mark" style={{ width: size, height: size, borderRadius: radius ?? Math.round(size * 0.3) }}>
      <Ic name="agent" size={Math.round(size * 0.55)} />
    </span>
  );
}

/* ---- Avatars ---- */
const AV_TONES: Record<string, { bg: string; fg: string }> = {
  a: { bg: "#1a1a19", fg: "#fff" },
  b: { bg: "#e8e7e3", fg: "#3a3a38" },
  c: { bg: "#c9c8c2", fg: "#2a2a28" },
  d: { bg: "#f0efec", fg: "#6b6b68" },
};
export interface AvatarPerson { name: string; tone?: string; live?: boolean }
export function Avatar({ name = "", tone = "b", size = 26, ring = false, live = false, style }: AvatarPerson & { size?: number; ring?: boolean; style?: CSSProperties }) {
  const t = AV_TONES[tone] || AV_TONES.b;
  const initials = name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <span className="mck-av" style={{ width: size, height: size, background: t.bg, color: t.fg, fontSize: size * 0.4, boxShadow: ring ? "0 0 0 2px #fff, 0 0 0 3px #e8e7e3" : "none", ...style }}>
      {initials}
      {live && <span className="mck-live" style={{ width: size * 0.28, height: size * 0.28 }} />}
    </span>
  );
}
export function AvatarStack({ people = [], size = 26, max = 4 }: { people?: AvatarPerson[]; size?: number; max?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="mck-avstack">
      {shown.map((p, i) => <span key={i} style={{ marginLeft: i ? -size * 0.32 : 0, zIndex: 10 - i }}><Avatar {...p} size={size} ring /></span>)}
      {extra > 0 && <span className="mck-av mck-av-more" style={{ width: size, height: size, fontSize: size * 0.36, marginLeft: -size * 0.32 }}>+{extra}</span>}
    </span>
  );
}

/* ---- Small bits ---- */
export function Mono({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <span className={"mck-mono " + className} style={style}>{children}</span>;
}
export type DotTone = "ink" | "ink-2" | "ink-3" | "accent" | "ok" | "warn" | "risk";
export function Dot({ tone = "ink", pulse = false, size = 7 }: { tone?: DotTone; pulse?: boolean; size?: number }) {
  return <span className={"mck-dot" + (pulse ? " mck-dot-pulse" : "")} style={{ width: size, height: size, background: `var(--${tone})` }} />;
}
export function Chip({ children, icon, active = false, onClick }: { children: ReactNode; icon?: IcName; active?: boolean; onClick?: () => void }) {
  return <button className={"mck-chip" + (active ? " is-active" : "")} onClick={onClick}>{icon && <Ic name={icon} size={13} />}{children}</button>;
}
export function Btn({ children, icon, variant = "ghost", size = "md", onClick, type = "button", disabled }: { children: ReactNode; icon?: IcName; variant?: "ghost" | "ink" | "quiet"; size?: "md" | "sm"; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return <button type={type} disabled={disabled} className={`mck-btn mck-btn-${variant} mck-btn-${size}`} onClick={onClick}>{icon && <Ic name={icon} size={14} />}{children}</button>;
}
export function IconBtn({ name, size = 16, onClick, title }: { name: IcName; size?: number; onClick?: () => void; title?: string }) {
  return <button className="mck-iconbtn" onClick={onClick} title={title} aria-label={title}><Ic name={name} size={size} /></button>;
}

/* ---- Status & severity pills (rationed to meaning) ---- */
export type PillTone = "neutral" | "ok" | "warn" | "risk" | "yulia";
export function StatusPill({ children, tone = "neutral", dot = true }: { children: ReactNode; tone?: PillTone; dot?: boolean }) {
  return <span className={`mck-pill mck-pill-${tone}`}>{dot && tone !== "neutral" && <span className="mck-pdot" />}{children}</span>;
}
/** Maps a severity label to the meaning palette: High→risk, Medium→warn, else neutral. */
export function SeverityPill({ level }: { level: string }) {
  const l = (level || "").toLowerCase();
  const tone: PillTone = l.includes("high") || l.includes("critical") ? "risk" : l.includes("med") ? "warn" : l.includes("low") ? "ok" : "neutral";
  return <StatusPill tone={tone} dot={false}>{level}</StatusPill>;
}

/* ---- Eyebrow (mono uppercase micro-label) ---- */
export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span className="mck-eyebrow" style={style}>{children}</span>;
}
