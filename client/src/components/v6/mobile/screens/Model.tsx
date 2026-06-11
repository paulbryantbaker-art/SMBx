/**
 * MobileModelScreen — the full interactive model canvas on a phone.
 *
 * Wave 3: the 11 interactive models render for real on mobile — no more
 * read-only slider fallback. This screen is a thin frame around the SAME
 * ModelRenderer + zustand modelStore the desktop canvas uses, so a model
 * opened from chat on a phone is the same living tab Yulia reads back
 * (update_model / read_tab_state target the same tab id).
 *
 * Scroll architecture: normal document flow — no position:fixed (Safari
 * toolbar rule). The top bar is `position:sticky`, which works in both
 * launch modes (PWA standalone: .mobile-root scrolls; Safari tab: body
 * scrolls). The body owns the 16px gutters (`.mobile-model-body .p-5`
 * collapses the model root's horizontal padding in index.css) plus
 * tab-bar/safe-area clearance at the bottom.
 */
import { useEffect, useState, type CSSProperties } from "react";
import ModelRenderer from "../../../models/ModelRenderer";
import { WorkSeal } from "../../shared/WorkSeal";
import { useModelStore, getPersistedOutputHash, type ModelType } from "../../../../lib/modelStore";
import { MobileIcon } from "../icons";

/** Model types the store can recalculate and ModelRenderer can draw.
 *  Mirrors the desktop allowlist in V6App.tsx (CANVAS_MODEL_TYPES). */
const MOBILE_CANVAS_MODEL_TYPES = new Set<ModelType>([
  "valuation",
  "lbo",
  "sba_financing",
  "dcf",
  "sensitivity",
  "comparison",
  "cap_table",
  "earnout",
  "tax_impact",
  "working_capital",
  "covenant",
  "sde_analysis",
]);

function normalizeModelType(value: unknown): ModelType | null {
  return typeof value === "string" && MOBILE_CANVAS_MODEL_TYPES.has(value as ModelType)
    ? (value as ModelType)
    : null;
}

// Titles can arrive ALL-CAPS from older payloads. Render sentence case while
// keeping finance acronyms and already-mixed-case titles intact (same recipe
// as Analysis.tsx — visible titles, not shouty kickers).
function sentenceTitle(value: string): string {
  const s = String(value ?? "").trim();
  if (!s || s !== s.toUpperCase()) return s;
  const cased = s.toLowerCase().replace(
    /\b(ebitda|sde|nwc|dcf|irr|moic|lbo|sba|dscr|roi|wacc|capex|ltv|noi|ev|cim|loi|qoe|pmi)\b/g,
    m => m.toUpperCase(),
  );
  return cased.charAt(0).toUpperCase() + cased.slice(1);
}

/**
 * Bridge a `create_model_tab` SSE canvas_action into a live modelStore tab.
 *
 * Uses the SAME store actions the desktop path uses (V6App.tsx):
 *   - `restoreTab` when the server issued a tab id — preserves the id so
 *     later update_model / read_tab_state actions and Yulia's tools hit it,
 *     and threads parentOutputHash into the persist lineage.
 *   - `createTab` only when no id came through (store mints its own id).
 *
 * Returns null when modelType isn't something the store/renderer supports —
 * the caller should fall back to the analysis view in that case.
 */
export function ensureModelTabFromCanvasAction(detail: any): { tabId: string; title: string } | null {
  if (!detail || typeof detail !== "object") return null;
  const modelType = normalizeModelType(detail.modelType);
  if (!modelType) return null;

  const title = typeof detail.title === "string" && detail.title.trim()
    ? detail.title.trim()
    : "Interactive model";
  const assumptions =
    detail.initialAssumptions && typeof detail.initialAssumptions === "object" && !Array.isArray(detail.initialAssumptions)
      ? detail.initialAssumptions as Record<string, any>
      : {};
  const dealId = typeof detail.dealId === "number" && Number.isFinite(detail.dealId)
    ? detail.dealId
    : undefined;
  const parentOutputHash = typeof detail.parentOutputHash === "string" && detail.parentOutputHash
    ? detail.parentOutputHash
    : null;

  const store = useModelStore.getState();
  if (typeof detail.tabId === "string" && detail.tabId) {
    store.restoreTab(detail.tabId, modelType, title, assumptions, dealId, parentOutputHash);
    return { tabId: detail.tabId, title };
  }
  const tabId = store.createTab(modelType, title, assumptions, dealId);
  return { tabId, title };
}

export function MobileModelScreen({
  modelTabId,
  title,
  onBack,
  onTalkToYulia,
}: {
  modelTabId: string;
  title: string;
  onBack: () => void;
  onTalkToYulia: (prompt: string) => void;
}) {
  const tab = useModelStore(s => s.tabs[modelTabId]);
  const heading = sentenceTitle(tab?.title || title);

  // Signed line — renders ONLY a hash the persist path actually returned for
  // this tab (model_executions). The write is debounced (~900ms) plus a
  // network round trip, so re-check shortly after the latest model change;
  // until a real hash exists, nothing renders (the WorkSeal honesty rule).
  const [outputHash, setOutputHash] = useState<string | null>(() => getPersistedOutputHash(modelTabId));
  useEffect(() => {
    setOutputHash(getPersistedOutputHash(modelTabId));
    const t1 = window.setTimeout(() => setOutputHash(getPersistedOutputHash(modelTabId)), 1600);
    const t2 = window.setTimeout(() => setOutputHash(getPersistedOutputHash(modelTabId)), 4200);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [modelTabId, tab?.updatedAt]);

  return (
    <div style={S.page}>
      <header style={S.topBar}>
        <button type="button" onClick={onBack} aria-label="Back" style={S.backButton}>
          <MobileIcon name="back" size={15} c="var(--mb-ink)" />
        </button>
        <h1 style={S.title}>{heading}</h1>
      </header>

      {tab ? (
        <div className="mobile-model-body" style={S.body}>
          <ModelRenderer tabId={modelTabId} onTalkToYulia={onTalkToYulia} />
          {outputHash && (
            <div style={S.sealRow}>
              <WorkSeal modelId={`MODEL.${tab.type}.v1`} outputHash={outputHash} />
            </div>
          )}
        </div>
      ) : (
        <div className="mobile-model-body" style={S.body}>
          <section style={S.missingCard}>
            <h2 style={S.missingTitle}>This model isn't open anymore</h2>
            <p style={S.missingCopy}>
              The live model state for “{heading}” is gone from this session.
              Ask Yulia to rerun it and it reopens here with working inputs.
            </p>
            <button
              type="button"
              style={S.askButton}
              onClick={() => onTalkToYulia(
                `Reopen ${heading} as an interactive model canvas with the latest saved assumptions, and tell me what changed since the last run.`,
              )}
            >
              Ask Yulia to rerun it
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--mb-bg, #FFFFFF)",
    color: "var(--mb-ink)",
  },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    padding: "calc(env(safe-area-inset-top, 0px) + 6px) 12px 6px 4px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderBottom: "0.5px solid var(--mb-line-2, rgba(31,42,66,0.14))",
  },
  backButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    background: "transparent",
    border: "none",
    borderRadius: 22,
    padding: 0,
  },
  title: {
    margin: 0,
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: 650,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    color: "var(--mb-ink)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  body: {
    // The model root keeps its vertical padding; its horizontal p-5 collapses
    // via `.mobile-model-body .p-5` in index.css so this 16px gutter is the
    // single source of side padding. Bottom: safe area + tab bar clearance.
    padding: "0 16px calc(env(safe-area-inset-bottom, 0px) + 110px)",
    overflowX: "hidden",
  },
  sealRow: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 4,
  },
  missingCard: {
    marginTop: 18,
    borderRadius: 28,
    padding: 22,
    background: "#172135",
    color: "#FFFFFF",
  },
  missingTitle: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.15,
    fontWeight: 900,
  },
  missingCopy: {
    margin: "12px 0 0",
    fontSize: 15,
    lineHeight: 1.45,
    color: "rgba(255,255,255,0.86)",
  },
  askButton: {
    marginTop: 18,
    minHeight: 48,
    width: "100%",
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    padding: "0 18px",
    fontWeight: 900,
    fontSize: 15,
  },
};
