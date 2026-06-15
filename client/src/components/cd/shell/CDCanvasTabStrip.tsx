/* ============================================================
   CDCanvasTabStrip — IDE-style tab strip above the floating canvas.
   Open work items (deals, docs, analyses, models, files) live here
   as rounded chips inside a single tray; the active chip lifts onto
   the surface (per the CD mockup's CanvasTabStrip). Deal chips carry
   their deal color; others a kind glyph. Each chip is a real focusable
   button (keyboard + screen-reader), with a sibling close button.
   (Per-deal grouped/collapsible trays land with MIG-5 once dealId is
   threaded onto reconstructed child tabs.)
   ============================================================ */
import { CDIcon, type CDIconName } from "./cdAtoms";

export interface CDStripTab { id: string; title: string; kind: string; color?: string }

const KIND_ICON: Record<string, CDIconName> = {
  deal: "portfolio",
  doc: "doc",
  analysis: "scenario",
  model: "model",
  "files-list": "docs",
  "deals-list": "portfolio",
  "marketing-studio": "grid",
  "deal-team": "portfolio",
  "provider-profile": "portfolio",
  learn: "doc",
  settings: "settings",
  history: "clock",
};

export function CDCanvasTabStrip({
  tabs, activeId, onPick, onClose, onNew,
}: {
  tabs: CDStripTab[];
  activeId: string | null;
  onPick: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="cd-scrollable" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 6px", background: "transparent", flexShrink: 0, overflowX: "auto" }}>
      {/* one tray; chips are transparent until active, then lift onto the surface */}
      <div role="tablist" aria-label="Open tabs" style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 9, padding: 3, flexShrink: 0 }}>
        {tabs.map((t) => {
          const active = t.id === activeId;
          return (
            <div
              key={t.id}
              onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); onClose(t.id); } }}
              onMouseDown={(e) => { if (e.button === 1) e.preventDefault(); }}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 4px 3px 8px", borderRadius: 6, background: active ? "var(--cd-surface)" : "transparent", boxShadow: active ? "var(--cd-shadow-sm)" : "none", maxWidth: 220, flexShrink: 0 }}
            >
              <button
                role="tab"
                aria-selected={active}
                onClick={() => onPick(t.id)}
                title={t.title}
                style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: "transparent", cursor: "pointer", padding: "3px 2px", minWidth: 0, fontFamily: "var(--cd-sans)" }}
              >
                {t.color
                  ? <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                  : <CDIcon name={KIND_ICON[t.kind] || "model"} size={13} color={active ? "var(--cd-accent)" : "var(--cd-ink-4)"} />}
                <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: active ? "var(--cd-ink)" : "var(--cd-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</span>
              </button>
              <button onClick={() => onClose(t.id)} aria-label={`Close ${t.title}`} title="Close" style={{ width: 18, height: 18, borderRadius: 5, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}><CDIcon name="close" size={11} color="var(--cd-ink-4)" /></button>
            </div>
          );
        })}
      </div>
      <button onClick={onNew} title="New (⌘K)" aria-label="New tab" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--cd-line)", background: "var(--cd-surface)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}><CDIcon name="plus" size={15} color="var(--cd-ink-3)" /></button>
    </div>
  );
}
