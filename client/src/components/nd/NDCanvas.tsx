/* ============================================================================
   NDCanvas — the canvas host beside Yulia's chat. When Yulia opens an artifact
   (canvas_action: show_content / create_model_tab / open_tab / update_model),
   it appears here as a tab next to the current surface. Chat stays on the right;
   this is the canvas on the left — the same chat-left / canvas-right split as a
   deal workspace (and Claude Code).

   Honest rendering: documents & analyses render their real markdown; a model
   artifact renders the real assumptions Yulia set (read-only) plus an honest
   note that the interactive model lives in the deal's Model tab. No fabrication.
   ============================================================================ */
import type { ReactNode } from "react";
import Markdown from "react-markdown";
import { Ic, Mono, YuliaMark, type IcName } from "./primitives";
import { EmptyChart } from "./chrome";

export interface NDArtifact {
  key: string;
  kind: "doc" | "analysis" | "model";
  title: string;
  /** rendered for doc/analysis */
  markdown?: string;
  /** read-only KV summary for model artifacts (the real assumptions Yulia set) */
  kv?: { k: string; v: string }[];
  /** honest clarifier line for non-interactive artifacts */
  note?: string;
}

const KIND_IC: Record<NDArtifact["kind"], IcName> = { doc: "doc", analysis: "bars", model: "sliders" };

export function NDCanvas({
  surfaceLabel,
  surface,
  artifacts,
  active,
  onSelect,
  onClose,
}: {
  surfaceLabel: string;
  surface: ReactNode;
  artifacts: NDArtifact[];
  /** "surface" or an artifact key */
  active: string;
  onSelect: (key: string) => void;
  onClose: (key: string) => void;
}) {
  const activeKey = active || "surface";
  const art = artifacts.find((a) => a.key === activeKey);
  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      <div className="mck-row" style={{ gap: 4, height: 44, flex: "0 0 44px", padding: "0 12px", borderBottom: "1px solid var(--line)", background: "var(--bg)", overflow: "hidden" }}>
        <span className="mck-eyebrow" style={{ marginRight: 6, flex: "0 0 auto" }}>Canvas</span>
        <button className={"mck-tab" + (activeKey === "surface" ? " is-active" : "")} onClick={() => onSelect("surface")}>
          <Ic name="grid" size={14} />{surfaceLabel}
        </button>
        {artifacts.map((a) => (
          <button key={a.key} className={"mck-tab" + (activeKey === a.key ? " is-active" : "")} onClick={() => onSelect(a.key)} title={a.title}>
            <Ic name={KIND_IC[a.kind]} size={14} />
            <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
            <span className="mck-tabclose" onClick={(e) => { e.stopPropagation(); onClose(a.key); }}><Ic name="x" size={11} /></span>
          </button>
        ))}
        <div className="mck-grow" />
        <span className="mck-pill mck-pill-yulia" style={{ flex: "0 0 auto" }}><span className="mck-pdot" />opened by Yulia</span>
      </div>

      <div className="mck-grow" style={{ overflow: "auto", minHeight: 0, background: activeKey === "surface" ? "transparent" : "var(--surface)" }}>
        {activeKey === "surface" ? surface : art ? <ArtifactBody art={art} /> : null}
      </div>
    </div>
  );
}

function ArtifactBody({ art }: { art: NDArtifact }) {
  if (art.kind === "doc" || art.kind === "analysis") {
    if (!art.markdown) {
      return <div style={{ padding: 24 }}><EmptyChart icon={KIND_IC[art.kind]} title={art.title} sub="Yulia is preparing this artifact — it'll fill in here as she works." /></div>;
    }
    return (
      <div style={{ padding: "30px 0" }}>
        <div className="mck-prose" style={{ maxWidth: 780, margin: "0 auto", padding: "0 34px", fontSize: 14, lineHeight: 1.72 }}>
          <Markdown>{art.markdown}</Markdown>
        </div>
      </div>
    );
  }
  // model — read-only honest summary
  return (
    <div style={{ padding: "30px 34px", maxWidth: 780, margin: "0 auto" }}>
      <div className="mck-row" style={{ gap: 10, marginBottom: 16 }}>
        <YuliaMark size={22} />
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>{art.title}</span>
      </div>
      {art.kv && art.kv.length > 0 ? (
        <div className="mck-card" style={{ padding: "4px 0", overflow: "hidden" }}>
          {art.kv.map((r, i) => (
            <div key={i} className="mck-row" style={{ gap: 12, padding: "11px 16px", borderTop: i ? "1px solid var(--line-2)" : "none" }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-3)", width: 220, flex: "0 0 220px" }}>{r.k}</span>
              <Mono className="mck-tnum" style={{ fontSize: 13 }}>{r.v}</Mono>
            </div>
          ))}
        </div>
      ) : (
        <EmptyChart icon="sliders" title="Model opened" sub="Yulia is computing — the assumptions and outputs will appear here." />
      )}
      {art.note && <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 16, lineHeight: 1.6 }}>{art.note}</p>}
    </div>
  );
}
