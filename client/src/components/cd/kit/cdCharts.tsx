/* ============================================================
   cdCharts.tsx — bespoke SVG charts for the CD app surfaces.
   Ported from the CD handoff (charts.jsx), themed via --cd-* tokens
   so they render correctly inside any .cd-root surface. Resolution
   independent. Shared by every CD page (Today/Portfolio/Analysis/…).
   ============================================================ */
import { Fragment } from "react";

export interface XY { x: number; y: number }

/* smooth path (Catmull-Rom → cubic bezier) */
export function smoothPath(pts: XY[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

let _uid = 0;
const uid = (p: string) => `${p}${(_uid = (_uid + 1) % 100000)}`;

export function CDSparkline({ data, w = 84, h = 26, color = "var(--cd-accent)", fill = false, sw = 1.6 }: { data: number[]; w?: number; h?: number; color?: string; fill?: boolean; sw?: number }) {
  if (!data || data.length < 2) return <svg width={w} height={h} />;
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - 2 - ((v - min) / rng) * (h - 4) }));
  const d = smoothPath(pts);
  const id = uid("sg");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      {fill && (
        <>
          <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style={{ stopColor: color, stopOpacity: 0.22 }} /><stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} /></linearGradient></defs>
          <path d={`${d} L ${w} ${h} L 0 ${h} Z`} style={{ fill: `url(#${id})` }} />
        </>
      )}
      <path d={d} fill="none" style={{ stroke: color }} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function CDAreaChart({ data, labels, w = 560, h = 200, color = "var(--cd-accent)", pad = { t: 14, r: 8, b: 22, l: 34 }, format = (v: number) => String(v), yticks = 4 }: { data: number[]; labels?: string[]; w?: number; h?: number; color?: string; pad?: { t: number; r: number; b: number; l: number }; format?: (v: number) => string; yticks?: number }) {
  if (!data || data.length < 2) return <svg width="100%" viewBox={`0 0 ${w} ${h}`} />;
  const min = 0, max = Math.max(...data) * 1.12, rng = max - min || 1;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * iw;
  const y = (v: number) => pad.t + ih - ((v - min) / rng) * ih;
  const pts = data.map((v, i) => ({ x: x(i), y: y(v) }));
  const d = smoothPath(pts), id = uid("ag");
  const ticks = Array.from({ length: yticks + 1 }, (_, i) => min + (rng / yticks) * i);
  const last = pts[pts.length - 1];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }} className="cd-num">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style={{ stopColor: color, stopOpacity: 0.18 }} /><stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} /></linearGradient></defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} style={{ stroke: "var(--cd-line)" }} strokeWidth="1" />
          <text x={pad.l - 8} y={y(t) + 3} textAnchor="end" style={{ fill: "var(--cd-ink-4)", fontSize: 9 }}>{format(t)}</text>
        </g>
      ))}
      <path d={`${d} L ${x(data.length - 1)} ${pad.t + ih} L ${pad.l} ${pad.t + ih} Z`} style={{ fill: `url(#${id})` }} />
      <path d={d} fill="none" style={{ stroke: color }} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="3.5" style={{ fill: "var(--cd-surface)", stroke: color }} strokeWidth="2.2" />
      {labels && labels.map((l, i) => (i % 2 === 0 || i === labels.length - 1) ? (
        <text key={i} x={x(i)} y={h - 5} textAnchor="middle" style={{ fill: "var(--cd-ink-4)", fontSize: 9 }}>{l}</text>
      ) : null)}
    </svg>
  );
}

export function CDBarChart({ data, labels, colors, w = 360, h = 180, pad = { t: 12, r: 6, b: 24, l: 30 } }: { data: number[]; labels?: string[]; colors?: string[]; w?: number; h?: number; pad?: { t: number; r: number; b: number; l: number } }) {
  if (!data || !data.length) return <svg width="100%" viewBox={`0 0 ${w} ${h}`} />;
  const max = Math.max(...data) * 1.1 || 1;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const bw = (iw / data.length) * 0.56, gap = iw / data.length;
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }} className="cd-num">
      {[0, 0.5, 1].map((f, i) => <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + ih - f * ih} y2={pad.t + ih - f * ih} style={{ stroke: "var(--cd-line)" }} strokeWidth="1" />)}
      {data.map((v, i) => {
        const bx = pad.l + gap * i + (gap - bw) / 2;
        const col = colors ? colors[i % colors.length] : "var(--cd-accent)";
        return (
          <g key={i}>
            <rect x={bx} y={y(v)} width={bw} height={pad.t + ih - y(v)} rx="4" style={{ fill: col }} />
            {labels && <text x={bx + bw / 2} y={h - 8} textAnchor="middle" style={{ fill: "var(--cd-ink-3)", fontSize: 9 }}>{labels[i]}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export interface DonutSlice { value: number; color: string }
export function CDDonut({ data, size = 132, thickness = 18, gap = 0.012 }: { data: DonutSlice[]; size?: number; thickness?: number; gap?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2;
  let a = -Math.PI / 2;
  const arcs = data.map((d) => {
    const frac = d.value / total;
    const a0 = a + gap * Math.PI, a1 = a + frac * 2 * Math.PI - gap * Math.PI;
    a += frac * 2 * Math.PI;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return { d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`, color: d.color };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {arcs.map((arc, i) => <path key={i} d={arc.d} fill="none" style={{ stroke: arc.color }} strokeWidth={thickness} strokeLinecap="round" />)}
    </svg>
  );
}

export interface WaterfallItem { label: string; value: number; type: "base" | "inc" | "dec" | "total" }
export function CDWaterfall({ items, w = 520, h = 220, pad = { t: 16, r: 10, b: 30, l: 44 }, format = (v: number) => String(v) }: { items: WaterfallItem[]; w?: number; h?: number; pad?: { t: number; r: number; b: number; l: number }; format?: (v: number) => string }) {
  if (!items || !items.length) return <svg width="100%" viewBox={`0 0 ${w} ${h}`} />;
  let running = 0;
  const bars = items.map((it) => {
    if (it.type === "base" || it.type === "total") { running = it.value; return { ...it, from: 0, to: it.value }; }
    const from = running; running += it.value; return { ...it, from, to: running };
  });
  const allVals = bars.flatMap((b) => [b.from, b.to]);
  const max = Math.max(...allVals) * 1.08, min = Math.min(0, ...allVals), rng = max - min || 1;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const bw = (iw / items.length) * 0.6, gap = iw / items.length;
  const y = (v: number) => pad.t + ih - ((v - min) / rng) * ih;
  const colorFor = (t: string) => t === "inc" ? "var(--cd-pos)" : t === "dec" ? "var(--cd-neg)" : "var(--cd-accent)";
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }} className="cd-num">
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + ih - f * ih} y2={pad.t + ih - f * ih} style={{ stroke: "var(--cd-line)" }} strokeWidth="1" />)}
      {bars.map((b, i) => {
        const bx = pad.l + gap * i + (gap - bw) / 2;
        const top = y(Math.max(b.from, b.to)), ht = Math.abs(y(b.from) - y(b.to)) || 2;
        return (
          <g key={i}>
            {i < bars.length - 1 && <line x1={bx + bw} x2={pad.l + gap * (i + 1) + (gap - bw) / 2} y1={y(b.to)} y2={y(b.to)} style={{ stroke: "var(--cd-line-2)" }} strokeWidth="1" strokeDasharray="2 2" />}
            <rect x={bx} y={top} width={bw} height={ht} rx="3" style={{ fill: colorFor(b.type) }} />
            <text x={bx + bw / 2} y={top - 5} textAnchor="middle" style={{ fill: "var(--cd-ink-2)", fontSize: 8.5, fontWeight: 600 }}>{format(b.to)}</text>
            <text x={bx + bw / 2} y={h - 16} textAnchor="middle" style={{ fill: "var(--cd-ink-3)", fontSize: 8.5 }}>{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function CDHeatmap({ rows, cols, data, format = (v: number) => v.toFixed(1) }: { rows: string[]; cols: string[]; data: number[][]; format?: (v: number) => string }) {
  const flat = data.flat();
  const min = Math.min(...flat), max = Math.max(...flat);
  const cell = (v: number) => { const t = (v - min) / (max - min || 1); return `oklch(${0.97 - t * 0.34} ${0.04 + t * 0.12} 158)`; };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `auto repeat(${cols.length}, 1fr)`, gap: 3, fontFamily: "var(--cd-mono)", fontSize: 11 }}>
      <div />
      {cols.map((c, i) => <div key={i} style={{ textAlign: "center", color: "var(--cd-ink-3)", fontSize: 10, paddingBottom: 4 }}>{c}</div>)}
      {rows.map((r, ri) => (
        <Fragment key={ri}>
          <div style={{ color: "var(--cd-ink-3)", fontSize: 10, display: "flex", alignItems: "center", paddingRight: 8, justifyContent: "flex-end" }}>{r}</div>
          {cols.map((_, ci) => {
            const v = data[ri][ci];
            const isBase = ri === Math.floor(rows.length / 2) && ci === Math.floor(cols.length / 2);
            return <div key={ci} style={{ background: cell(v), textAlign: "center", padding: "9px 4px", borderRadius: 5, color: "var(--cd-ink)", fontVariantNumeric: "tabular-nums", fontWeight: isBase ? 700 : 500, outline: isBase ? "1.5px solid var(--cd-accent)" : "none", outlineOffset: -1.5 }}>{format(v)}</div>;
          })}
        </Fragment>
      ))}
    </div>
  );
}

export function CDStageBar({ stages, current }: { stages: string[]; current: number }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {stages.map((s, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ height: 5, borderRadius: 4, background: i <= current ? "var(--cd-accent)" : "var(--cd-line-2)", opacity: i <= current ? 1 - (current - i) * 0.13 : 1 }} />
          <div style={{ fontSize: 9.5, fontFamily: "var(--cd-mono)", color: i === current ? "var(--cd-accent)" : "var(--cd-ink-4)", fontWeight: i === current ? 600 : 400, whiteSpace: "nowrap" }}>{s}</div>
        </div>
      ))}
    </div>
  );
}
