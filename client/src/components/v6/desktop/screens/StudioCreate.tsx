/**
 * Atlas — STUDIO (the creation studio).
 *
 * Studio is the WORKBENCH where you build custom deal collateral — sell-side
 * marketing (blind teaser, CIM, sales deck, buyer list, outreach), investment
 * memos, valuations, etc. It is NOT a library: pick a deal + a collateral type
 * (or tell Yulia), Yulia builds it, and the finished work AUTO-FILES into the
 * deal's data room — i.e. it lands in Files. Studio holds nothing permanently.
 *
 * Backend: GET /api/deliverables/catalog (the active menu_items) + the existing
 * generateDealDeliverable() (POST /deals/:id/deliverables → queues + generates →
 * autoFileDeliverable → Files). Paywall (free tier = one free deliverable) comes
 * back as a rich error → honest upgrade note. Nothing fabricated.
 *
 * Polish standard: float on the shell gradient, T.border cards, tone not lines.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import { useMobileDeals } from "../../../../hooks/useMobileDeals";
import {
  useV6WorkspaceData,
  generateDealDeliverable,
} from "../../../../hooks/useV6WorkspaceData";
import { DEV_AUTH_BYPASS, authHeaders, type User } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";
import { EmptyState, LoadingState, Sparkle } from "../primitives";
import { SendArrowIcon, ChevronRightIcon, CheckIcon } from "../icons";

/* ─── catalog hook (generic; loads even before sign-in) ───── */

interface CatalogItem {
  slug: string;
  name: string;
  description: string | null;
  journey: "sell" | "buy" | "raise" | "pmi" | null;
  gate: string | null;
  category: string | null;
  tier: string | null;
  deliverable_type: string | null;
}

function useDeliverableCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetch("/api/deliverables/catalog", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((j) => {
        if (!alive) return;
        setItems(Array.isArray(j.items) ? j.items : []);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);
  return { items, loading };
}

/* ─── category grouping (marketing/packaging leads) ───────── */

const CATEGORY_META: Record<string, { label: string; order: number }> = {
  packaging: { label: "Marketing & packaging", order: 0 },
  sourcing: { label: "Buyers & outreach", order: 1 },
  valuation: { label: "Valuation", order: 2 },
  diligence: { label: "Diligence", order: 3 },
  structuring: { label: "Structuring", order: 4 },
  closing: { label: "Closing", order: 5 },
  raise: { label: "Capital raise", order: 6 },
  pmi: { label: "Post-merger", order: 7 },
};
function categoryMeta(cat: string | null) {
  return (cat && CATEGORY_META[cat]) || { label: cat ? titleCase(cat) : "Other", order: 50 };
}
function titleCase(s: string) {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function journeyOf(gate: string | null | undefined): "sell" | "buy" | "raise" | "pmi" | null {
  const c = (gate ?? "").trim().charAt(0).toUpperCase();
  if (c === "S") return "sell";
  if (c === "B") return "buy";
  if (c === "R") return "raise";
  if (c === "P") return "pmi";
  return null;
}

/* ─── a started build (this session only — Files is the home) ─ */

interface Building {
  key: string;
  deliverableId: number;
  label: string;
  dealId: number;
  dealName: string;
}

/* ─── root ─────────────────────────────────────────────────── */

export default function StudioCreate({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const { items: catalog, loading: catalogLoading } = useDeliverableCatalog();
  const dealRows = useMobileDeals(user).all;
  const { deliverables, refresh } = useV6WorkspaceData(user);
  const canCreate = !!user && !DEV_AUTH_BYPASS;

  const deals = useMemo(
    () => dealRows.map((r) => ({ id: r.rawId, name: r.name, journey: journeyOf(r.gate) })),
    [dealRows],
  );
  const [dealId, setDealId] = useState<number | null>(null);
  useEffect(() => {
    if (dealId == null && deals.length) setDealId(deals[0].id);
  }, [deals, dealId]);
  const deal = deals.find((d) => d.id === dealId) ?? null;

  const [started, setStarted] = useState<Building[]>([]);
  const [paywall, setPaywall] = useState<{ message: string; checkoutUrl?: string } | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  // Poll while any started build is still pending (status not complete/failed).
  const statusById = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of deliverables) m.set(d.id, (d.status ?? "").toLowerCase());
    return m;
  }, [deliverables]);
  const pending = started.some((b) => {
    const s = statusById.get(b.deliverableId);
    return !s || !/complete|completed|failed|error/.test(s);
  });
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => refreshRef.current(), 5000);
    return () => clearInterval(t);
  }, [pending]);

  // Catalog filtered to the deal's journey (+ universal). No deal → universal.
  const groups = useMemo(() => {
    // With a deal: show its journey's collateral + universal. No deal yet: show
    // the full range so the user sees what Studio can build (build stays gated).
    const filtered = deal ? catalog.filter((it) => it.journey == null || it.journey === deal.journey) : catalog;
    const byCat = new Map<string, CatalogItem[]>();
    for (const it of filtered) {
      const key = it.category ?? "other";
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(it);
    }
    return [...byCat.entries()]
      .map(([cat, list]) => ({ cat, ...categoryMeta(cat), list }))
      .sort((a, b) => a.order - b.order);
  }, [catalog, deal?.journey]);

  const build = useCallback(
    async (slug: string, label: string) => {
      if (!deal) return;
      setPaywall(null);
      setBusySlug(slug);
      try {
        const r = await generateDealDeliverable({ dealId: deal.id, menuItemSlug: slug });
        setStarted((prev) => [
          { key: `${slug}-${r.deliverableId}`, deliverableId: r.deliverableId, label, dealId: deal.id, dealName: deal.name },
          ...prev.filter((b) => b.deliverableId !== r.deliverableId),
        ]);
        void refresh();
      } catch (e: any) {
        if (e?.status === 402 || e?.code === "payment_required") {
          setPaywall({ message: e.message || "This needs a paid plan.", checkoutUrl: e.checkoutUrl });
        } else {
          setPaywall({ message: e?.message || "Couldn’t start that build." });
        }
      } finally {
        setBusySlug(null);
      }
    },
    [deal, refresh],
  );

  return (
    <div style={S.root}>
      <div style={S.pane}>
        {/* header */}
        <div style={S.h1}>Studio</div>
        <div style={S.sub}>Build custom collateral for a deal. Finished work is saved to Files.</div>

        {/* tell-Yulia prompt + deal picker */}
        <div style={S.promptRow}>
          <Sparkle size={17} />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && prompt.trim()) {
                chat?.send(
                  deal ? `In Studio: build this for ${deal.name} — ${prompt.trim()}` : `In Studio: ${prompt.trim()}`,
                );
                setPrompt("");
              }
            }}
            placeholder="Tell Yulia what to build…"
            style={S.promptInput}
          />
          {deals.length > 0 && (
            <select value={dealId ?? ""} onChange={(e) => setDealId(e.target.value ? Number(e.target.value) : null)} style={S.dealSelect}>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            aria-label="Ask Yulia"
            disabled={!prompt.trim()}
            onClick={() => {
              if (!prompt.trim()) return;
              chat?.send(deal ? `In Studio: build this for ${deal.name} — ${prompt.trim()}` : `In Studio: ${prompt.trim()}`);
              setPrompt("");
            }}
            style={{ ...S.sendBtn, opacity: prompt.trim() ? 1 : 0.5 }}
          >
            <SendArrowIcon size={16} c="#fff" />
          </button>
        </div>

        {/* paywall / error */}
        {paywall && (
          <div style={S.paywall}>
            <div style={S.paywallMsg}>{paywall.message}</div>
            {paywall.checkoutUrl && (
              <button type="button" style={S.paywallBtn} onClick={() => window.location.assign(paywall.checkoutUrl!)}>
                Upgrade
              </button>
            )}
          </div>
        )}

        {/* building strip (this session) */}
        {started.length > 0 && (
          <div style={S.buildingWrap}>
            {started.map((b) => {
              const s = statusById.get(b.deliverableId) ?? "queued";
              const done = /complete|completed/.test(s);
              const failed = /failed|error/.test(s);
              return (
                <div key={b.key} style={S.buildRow}>
                  <span style={S.buildIcon}>
                    {done ? <CheckIcon size={14} c={T.green} /> : failed ? "!" : <Spinner />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.buildLabel}>{b.label}</div>
                    <div style={S.buildSub}>
                      {b.dealName} ·{" "}
                      {done ? "saved to Files" : failed ? "generation failed" : "building…"}
                    </div>
                  </div>
                  {done && (
                    <button type="button" style={S.viewBtn} onClick={() => nav.go("files", { dealId: b.dealId, dealName: b.dealName })}>
                      View in Files <ChevronRightIcon size={14} c={T.blue} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* the catalog */}
        {catalogLoading ? (
          <div style={{ marginTop: 24 }}>
            <LoadingState label="Loading collateral types…" />
          </div>
        ) : groups.length === 0 ? (
          <div style={{ marginTop: 24 }}>
            <EmptyState title="Couldn’t load collateral types" hint="Try again in a moment." />
          </div>
        ) : (
          <div style={{ marginTop: 22 }}>
            {!deal ? (
              <div style={S.signInNote}>
                {deals.length === 0
                  ? "Add a deal to build collateral for it — below is what Studio can make."
                  : "Pick a deal in the selector above to build one of these."}
                {deals.length === 0 && (
                  <button type="button" style={S.linkBtn} onClick={() => nav.go("deals")}>Add a deal →</button>
                )}
              </div>
            ) : !canCreate ? (
              <div style={S.signInNote}>Sign in to build — these are the collateral types available for {deal.name}.</div>
            ) : null}
            {groups.map((g) => (
              <div key={g.cat} style={{ marginBottom: 22 }}>
                <div style={S.groupLabel}>{g.label}</div>
                <div style={S.grid}>
                  {g.list.map((it) => (
                    <button
                      key={it.slug}
                      type="button"
                      disabled={!canCreate || !deal || busySlug != null}
                      onClick={() => build(it.slug, it.name)}
                      style={{ ...S.tile, opacity: !canCreate || !deal ? 0.6 : 1, cursor: !canCreate || !deal ? "default" : "pointer" }}
                    >
                      <div style={S.tileName}>{it.name}</div>
                      {it.description && <div style={S.tileBlurb}>{it.description}</div>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 13,
        height: 13,
        borderRadius: "50%",
        border: `2px solid ${T.progTrack}`,
        borderTopColor: T.blue,
        display: "inline-block",
        animation: "atlas-glow 1s linear infinite",
      }}
    />
  );
}

/* ─── styles ───────────────────────────────────────────────── */

const S: Record<string, React.CSSProperties> = {
  root: { flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" },
  pane: { padding: "22px 26px 40px", maxWidth: 1000, width: "100%" },
  h1: { fontSize: 22, fontWeight: 600, color: T.ink, letterSpacing: "-.01em" },
  sub: { fontSize: 13, color: T.muted, marginTop: 4 },

  promptRow: {
    display: "flex", alignItems: "center", gap: 10, marginTop: 16,
    background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: T.shCard, padding: "8px 10px 8px 14px",
  },
  promptInput: { flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 14.5, color: T.ink, fontFamily: T.font },
  dealSelect: { height: 34, borderRadius: 9, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 8px", fontSize: 13, color: T.ink, fontFamily: T.font, maxWidth: 200 },
  sendBtn: { width: 36, height: 36, flex: "none", borderRadius: "50%", border: "none", background: T.blue, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },

  paywall: { marginTop: 14, background: T.blueBg3, border: `1px solid ${T.approvalBd}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  paywallMsg: { fontSize: 13, color: T.ink3, lineHeight: 1.5 },
  paywallBtn: { background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: T.font, flex: "none" },

  buildingWrap: { marginTop: 16, display: "flex", flexDirection: "column", gap: 8 },
  buildRow: { display: "flex", alignItems: "center", gap: 11, background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shCard, padding: "11px 14px" },
  buildIcon: { width: 16, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", color: T.terra, fontWeight: 700 },
  buildLabel: { fontSize: 13.5, fontWeight: 600, color: T.ink },
  buildSub: { fontSize: 12, color: T.muted, marginTop: 1 },
  viewBtn: { display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", color: T.blue, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: T.font, flex: "none" },

  signInNote: { fontSize: 12.5, color: T.muted2, marginBottom: 14 },
  linkBtn: { marginLeft: 8, background: "transparent", border: "none", color: T.blue, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: T.font, padding: 0 },
  groupLabel: { fontSize: 13, color: T.muted, marginBottom: 10, fontWeight: 600 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 },
  tile: { textAlign: "left", background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rCard, boxShadow: T.shCard, padding: "13px 14px", fontFamily: T.font },
  tileName: { fontSize: 14, fontWeight: 600, color: T.ink },
  tileBlurb: { fontSize: 12, color: T.muted, marginTop: 3, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
};
