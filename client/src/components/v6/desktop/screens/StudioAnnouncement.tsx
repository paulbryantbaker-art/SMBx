/**
 * Atlas — Studio / Media library + Announcement card (2026-07-17).
 *
 * MEDIA: upload photos (png/jpeg/webp ≤12MB) into the studio_assets library;
 * each carries a FOCAL POINT (where the face/subject sits, as % from left/top)
 * that every composer uses to crop correctly in any layout. Thumbnails are
 * fetched with auth and object-URL'd (plain <img src> can't carry the JWT).
 *
 * ANNOUNCEMENT: the approved 1080×1350 LinkedIn announcement card — light
 * editorial split or dark textured — rendered server-side with the same brand
 * system as every artifact (real logo both treatments, coral, blackbleed).
 * Copy fields prefill with the shipped "better process" announcement so a new
 * card starts from a known-good composition.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";

interface AssetMeta {
  id: number;
  label: string;
  mime: string;
  width: number | null;
  height: number | null;
  focal_x: number;
  focal_y: number;
  bytes: number;
}

async function jsonApi<J>(path: string, init?: RequestInit): Promise<J> {
  const r = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as any)?.error || `Request failed (${r.status})`);
  return j as J;
}

const DEFAULTS = {
  headline: "The acquirers who win don’t have better deal flow.",
  accent: "They have better process.",
  sub: "Twenty years as the internal deal captain for major platforms — now running that same playbook for independent buyers.",
  bullets: [
    "What a business is worth to *them* — before the broker names a price.",
    "Which diligence findings are noise, and which are deal-breakers.",
    "The first 90 days after close decide more value than the last 90 of negotiation.",
  ].join("\n"),
  mandate: "Now taking new mandates — outsourced deal captain for a select number of active buyers.",
  kicker: "Announcement",
  footerTag: "smbx.ai · Book a call",
  footerNote: "Buy-side only · Lower middle market only",
};

export function StudioAnnouncement() {
  const [assets, setAssets] = useState<AssetMeta[] | null>(null);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [variant, setVariant] = useState<"light" | "dark">("light");
  const [assetId, setAssetId] = useState<number | null>(null);
  const [copy, setCopy] = useState(DEFAULTS);
  const [preview, setPreview] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    try {
      const { assets } = await jsonApi<{ assets: AssetMeta[] }>("/studio/assets");
      setAssets(assets);
      if (assets.length && assetId == null) setAssetId(assets[0].id);
      // Thumbnails: authed fetch → blob URLs, only for ones we don't have yet.
      for (const a of assets) {
        if (thumbs[a.id]) continue;
        fetch(`/api/studio/assets/${a.id}/raw`, { headers: authHeaders() })
          .then(r => (r.ok ? r.blob() : null))
          .then(b => { if (b) setThumbs(t => ({ ...t, [a.id]: URL.createObjectURL(b) })); })
          .catch(() => {});
      }
    } catch (e: any) {
      setNote({ kind: "err", text: e.message });
    }
  }, [assetId, thumbs]);

  useEffect(() => { loadAssets(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const upload = useCallback(async (file: File) => {
    setBusy(true); setNote(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("label", file.name.replace(/\.[a-z0-9]+$/i, ""));
      const r = await fetch("/api/studio/assets", { method: "POST", headers: authHeaders(), body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((j as any)?.error || "Upload failed");
      setNote({ kind: "ok", text: "Uploaded — set the focal point so faces stay framed." });
      await loadAssets();
    } catch (e: any) {
      setNote({ kind: "err", text: e.message });
    } finally { setBusy(false); }
  }, [loadAssets]);

  const patchAsset = useCallback(async (id: number, patch: { label?: string; focalX?: number; focalY?: number }) => {
    try {
      await jsonApi(`/studio/assets/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      setAssets(a => a?.map(x => x.id === id ? { ...x, label: patch.label ?? x.label, focal_x: patch.focalX ?? x.focal_x, focal_y: patch.focalY ?? x.focal_y } : x) ?? a);
    } catch (e: any) { setNote({ kind: "err", text: e.message }); }
  }, []);

  const removeAsset = useCallback(async (id: number) => {
    if (!window.confirm("Delete this photo from the library?")) return;
    try {
      await jsonApi(`/studio/assets/${id}`, { method: "DELETE" });
      setAssets(a => a?.filter(x => x.id !== id) ?? a);
      setAssetId(cur => (cur === id ? null : cur));
    } catch (e: any) { setNote({ kind: "err", text: e.message }); }
  }, []);

  const render = useCallback(async () => {
    setBusy(true); setNote(null);
    try {
      const body = {
        variant,
        assetId,
        save: true, // rendered output lands in the library's Collateral folder
        headline: copy.headline,
        accent: copy.accent,
        sub: copy.sub,
        bullets: copy.bullets.split("\n").map(s => s.trim()).filter(Boolean),
        mandate: copy.mandate,
        kicker: copy.kicker,
        footerTag: copy.footerTag,
        footerNote: copy.footerNote,
      };
      const r = await fetch("/api/studio/announcement.png", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as any)?.error || `Render failed (${r.status})`);
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      setPreview(p => { if (p) URL.revokeObjectURL(p); return url; });
      const a = document.createElement("a");
      a.href = url; a.download = `smbx-announcement-${variant}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setNote({ kind: "ok", text: "Rendered — downloaded, preview below." });
    } catch (e: any) {
      setNote({ kind: "err", text: e.message });
    } finally { setBusy(false); }
  }, [variant, assetId, copy]);

  const field = (label: string, key: keyof typeof DEFAULTS, rows = 1) => (
    <div style={S.field}>
      <div style={S.fieldLabel}>{label}</div>
      {rows > 1 ? (
        <textarea style={{ ...S.input, height: rows * 26 + 18, resize: "vertical" as const }} value={copy[key]}
          onChange={e => setCopy(c => ({ ...c, [key]: e.target.value }))} />
      ) : (
        <input style={S.input} value={copy[key]} onChange={e => setCopy(c => ({ ...c, [key]: e.target.value }))} />
      )}
    </div>
  );

  return (
    <div style={{ marginTop: 34 }}>
      <div style={S.secLabel}>Media</div>
      <div style={S.mediaBar}>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ""; }} />
        <button style={S.btn} disabled={busy} onClick={() => fileRef.current?.click()}>Upload photo</button>
        <span style={S.hint}>png / jpeg / webp, up to 12MB. Set each photo’s focal point (where the face sits) — every layout crops around it.</span>
      </div>
      <div style={S.grid}>
        {(assets ?? []).map(a => (
          <div key={a.id} style={{ ...S.card, outline: assetId === a.id ? `2px solid ${T.blue}` : "1px solid " + T.border }}>
            <div style={S.thumbWrap} onClick={() => setAssetId(a.id)} title="Use in the announcement card">
              {thumbs[a.id]
                ? <img src={thumbs[a.id]} alt={a.label} style={{ ...S.thumb, objectPosition: `${a.focal_x * 100}% ${a.focal_y * 100}%` }} />
                : <div style={{ ...S.thumb, background: T.hair }} />}
            </div>
            <input style={S.cardLabel} defaultValue={a.label} onBlur={e => { const v = e.target.value.trim(); if (v && v !== a.label) patchAsset(a.id, { label: v }); }} />
            <div style={S.focalRow}>
              <span style={S.focalLabel}>focal</span>
              <input type="range" min={0} max={100} value={Math.round(a.focal_x * 100)} style={{ flex: 1 }}
                onChange={e => patchAsset(a.id, { focalX: Number(e.target.value) / 100 })} title="Horizontal — where the subject sits, left to right" />
              <input type="range" min={0} max={100} value={Math.round(a.focal_y * 100)} style={{ flex: 1 }}
                onChange={e => patchAsset(a.id, { focalY: Number(e.target.value) / 100 })} title="Vertical — where the face sits, top to bottom" />
              <button style={S.del} onClick={() => removeAsset(a.id)} title="Delete">×</button>
            </div>
          </div>
        ))}
        {assets && assets.length === 0 && <div style={S.empty}>No media yet — upload the first photo.</div>}
      </div>

      <div style={{ ...S.secLabel, marginTop: 30 }}>Announcement card</div>
      <div style={S.annForm}>
        <div style={S.row}>
          <div style={S.segRow}>
            {(["light", "dark"] as const).map(v => (
              <button key={v} style={{ ...S.seg, ...(variant === v ? S.segOn : null) }} onClick={() => setVariant(v)}>
                {v === "light" ? "Light · photo right" : "Dark · photo card"}
              </button>
            ))}
          </div>
          <span style={S.hint}>Photo: click a thumbnail above to select — {assetId ? `#${assetId} selected` : "none selected"}</span>
        </div>
        {field("Headline", "headline")}
        {field("Accent line (coral)", "accent")}
        {field("Supporting line", "sub", 2)}
        {field("Bullets — one per line, *word* for italics (max 4)", "bullets", 3)}
        {field("Closing line", "mandate", 2)}
        <div style={S.threeCol}>
          {field("Kicker (dark only)", "kicker")}
          {field("Footer tag (mono)", "footerTag")}
          {field("Footer note (dark only)", "footerNote")}
        </div>
        <div style={S.row}>
          <button style={{ ...S.btn, ...S.btnPrimary }} disabled={busy || !copy.headline.trim()} onClick={render}>
            {busy ? "Rendering…" : "Render card (downloads PNG)"}
          </button>
          {note && <span style={{ ...S.hint, color: note.kind === "err" ? "#B3261E" : T.green }}>{note.text}</span>}
        </div>
        {preview && (
          <div style={S.previewWrap}>
            <img src={preview} alt="Announcement preview" style={S.preview} />
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  secLabel: { fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", color: T.muted, textTransform: "uppercase" as const, marginBottom: 10 },
  mediaBar: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const },
  hint: { fontSize: 12.5, color: T.muted, lineHeight: 1.4 },
  grid: { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 },
  card: { borderRadius: 12, padding: 8, background: "#fff" },
  thumbWrap: { cursor: "pointer", borderRadius: 8, overflow: "hidden" },
  thumb: { width: "100%", height: 150, objectFit: "cover" as const, display: "block", borderRadius: 8 },
  cardLabel: { width: "100%", marginTop: 8, fontSize: 12.5, fontWeight: 600, color: T.ink, border: "none", outline: "none", background: "transparent" },
  focalRow: { display: "flex", alignItems: "center", gap: 6, marginTop: 6 },
  focalLabel: { fontSize: 10.5, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.04em" },
  del: { border: "none", background: "transparent", color: T.muted, fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "0 2px" },
  empty: { fontSize: 13, color: T.muted, padding: "14px 2px" },
  annForm: { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 720 },
  row: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const },
  segRow: { display: "flex", gap: 6 },
  seg: { padding: "7px 14px", borderRadius: 99, border: `1px solid ${T.border}`, background: "#fff", fontSize: 13, fontWeight: 600, color: T.muted, cursor: "pointer" },
  segOn: { background: T.ink, borderColor: T.ink, color: "#fff" },
  field: { display: "flex", flexDirection: "column" as const, gap: 5, flex: 1, minWidth: 160 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: T.muted },
  input: { padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13.5, color: T.ink, fontFamily: "inherit", background: "#fff" },
  threeCol: { display: "flex", gap: 12, flexWrap: "wrap" as const },
  btn: { padding: "9px 16px", borderRadius: 99, border: `1px solid ${T.border}`, background: "#fff", fontSize: 13.5, fontWeight: 600, color: T.ink, cursor: "pointer" },
  btnPrimary: { background: T.blue, borderColor: T.blue, color: "#fff" },
  previewWrap: { marginTop: 6, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", maxWidth: 540 },
  preview: { width: "100%", display: "block" },
};

/* ─── Post cards — the daily-campaign template rack (2026-07-18) ──────────
 * Paste the day's brief → Smart fill picks a template (stat · quote ·
 * teardown · playbook) and drafts the fields from ONLY what's in the brief —
 * then every field is editable before rendering the 1080×1350 card. Quote
 * cards can carry a media-library photo chip.
 */

type CardTemplate = "stat" | "quote" | "thesis" | "playbook";
interface CardFields {
  kicker: string;
  value: string;
  claim: string;
  source: string;
  quote: string;
  name: string;
  role: string;
  title: string;
  rows: string;   // one per line, "LABEL | sentence"
  insight: string;
  steps: string;  // one per line
  footerTag: string;
}
const EMPTY_FIELDS: CardFields = {
  kicker: "", value: "", claim: "", source: "", quote: "",
  name: "Paul Baker", role: "Founder · smbX.ai", title: "", rows: "", insight: "", steps: "",
  footerTag: "smbx.ai · Book a call",
};
const TPL_LABEL: Record<CardTemplate, string> = {
  stat: "Big stat", quote: "Pull-quote", thesis: "Sector teardown", playbook: "Playbook",
};
const TPL_FIELDS: Record<CardTemplate, Array<{ key: keyof CardFields; label: string; rows?: number }>> = {
  stat: [
    { key: "kicker", label: "Kicker" }, { key: "value", label: "The number" },
    { key: "claim", label: "Claim", rows: 2 }, { key: "source", label: "Source" },
    { key: "footerTag", label: "Footer tag" },
  ],
  quote: [
    { key: "kicker", label: "Kicker" }, { key: "quote", label: "Quote", rows: 3 },
    { key: "name", label: "Name" }, { key: "role", label: "Role" },
    { key: "footerTag", label: "Footer tag" },
  ],
  thesis: [
    { key: "kicker", label: "Kicker" }, { key: "title", label: "Title", rows: 2 },
    { key: "rows", label: "Rows (one per line: LABEL | sentence)", rows: 4 },
    { key: "insight", label: "The read", rows: 2 }, { key: "footerTag", label: "Footer tag" },
  ],
  playbook: [
    { key: "kicker", label: "Kicker" }, { key: "title", label: "Title", rows: 2 },
    { key: "steps", label: "Steps (one per line)", rows: 5 }, { key: "footerTag", label: "Footer tag" },
  ],
};

export function StudioPostCards() {
  const [assets, setAssets] = useState<AssetMeta[] | null>(null);
  const [brief, setBrief] = useState("");
  const [choice, setChoice] = useState<CardTemplate | "auto">("auto");
  const [template, setTemplate] = useState<CardTemplate>("quote");
  const [variant, setVariant] = useState<"light" | "dark">("light");
  const [fields, setFields] = useState<CardFields>(EMPTY_FIELDS);
  const [assetId, setAssetId] = useState<number | null>(null);
  const [filled, setFilled] = useState(false);
  const [busy, setBusy] = useState<"fill" | "render" | null>(null);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    jsonApi<{ assets: AssetMeta[] }>("/studio/assets").then(j => setAssets(j.assets)).catch(() => setAssets([]));
  }, []);

  const smartFill = async () => {
    setBusy("fill"); setNote(null);
    try {
      const j = await jsonApi<{ spec: Record<string, unknown> }>("/studio/postcard/compose", {
        method: "POST",
        body: JSON.stringify({ brief, template: choice, variant }),
      });
      const sp = j.spec as any;
      const tpl: CardTemplate = (["stat", "quote", "thesis", "playbook"] as const).includes(sp.template) ? sp.template : "quote";
      setTemplate(tpl);
      setFields({
        ...EMPTY_FIELDS,
        kicker: sp.kicker || "",
        value: sp.value || "",
        claim: sp.claim || "",
        source: sp.source || "",
        quote: sp.quote || "",
        name: sp.name || EMPTY_FIELDS.name,
        role: sp.role || EMPTY_FIELDS.role,
        title: sp.title || "",
        rows: Array.isArray(sp.rows) ? sp.rows.map((r: any) => `${r.k} | ${r.v}`).join("\n") : "",
        insight: sp.insight || "",
        steps: Array.isArray(sp.steps) ? sp.steps.join("\n") : "",
        footerTag: sp.footerTag || EMPTY_FIELDS.footerTag,
      });
      setFilled(true);
      setNote({ kind: "ok", text: `Drafted as “${TPL_LABEL[tpl]}” — edit anything, then render.` });
    } catch (e) {
      setNote({ kind: "err", text: e instanceof Error ? e.message : "Smart fill failed" });
    } finally { setBusy(null); }
  };

  const render = async () => {
    setBusy("render"); setNote(null);
    try {
      const body: Record<string, unknown> = {
        template, variant,
        kicker: fields.kicker, value: fields.value, claim: fields.claim, source: fields.source,
        quote: fields.quote, name: fields.name, role: fields.role, title: fields.title,
        insight: fields.insight, footerTag: fields.footerTag,
        rows: fields.rows.split("\n").map(l => {
          const i = l.indexOf("|");
          return i > 0 ? { k: l.slice(0, i).trim(), v: l.slice(i + 1).trim() } : null;
        }).filter(Boolean),
        steps: fields.steps.split("\n").map(l => l.trim()).filter(Boolean),
        assetId,
        save: true, // rendered output lands in the library's Collateral folder
      };
      const r = await fetch("/api/studio/postcard.png", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as any)?.error || `Render failed (${r.status})`);
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      setPreview(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
      const a = document.createElement("a");
      a.href = url;
      a.download = `smbx-card-${template}-${variant}.png`;
      a.click();
      setNote({ kind: "ok", text: "Rendered and downloaded." });
    } catch (e) {
      setNote({ kind: "err", text: e instanceof Error ? e.message : "Render failed" });
    } finally { setBusy(null); }
  };

  const seg = (on: boolean): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 99, border: `1px solid ${on ? T.blue : T.border}`,
    background: on ? T.blueBg : "transparent", color: on ? T.blue : T.muted,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  });

  return (
    <div style={{ marginTop: 34 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>Post cards</div>
      <div style={{ marginTop: 6, fontSize: 13.5, color: T.muted, maxWidth: 620, lineHeight: 1.55 }}>
        Paste the day’s brief. Smart fill picks the template and drafts the copy from only what’s in
        your text — edit anything, then render the LinkedIn-ready card.
      </div>

      <textarea
        value={brief}
        onChange={e => setBrief(e.target.value)}
        placeholder="Today’s brief — the point you want to make, any numbers with their sources, the sector, the take…"
        rows={4}
        style={{ marginTop: 14, width: "100%", maxWidth: 720, padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" style={seg(choice === "auto")} onClick={() => setChoice("auto")}>Auto</button>
        {(Object.keys(TPL_LABEL) as CardTemplate[]).map(t => (
          <button key={t} type="button" style={seg(choice === t)} onClick={() => { setChoice(t); setTemplate(t); }}>{TPL_LABEL[t]}</button>
        ))}
        <span style={{ width: 14 }} />
        <button type="button" style={seg(variant === "light")} onClick={() => setVariant("light")}>Light</button>
        <button type="button" style={seg(variant === "dark")} onClick={() => setVariant("dark")}>Dark</button>
        <button
          type="button"
          disabled={busy !== null || brief.trim().length < 20}
          onClick={smartFill}
          style={{ marginLeft: 10, padding: "9px 18px", borderRadius: 99, border: "none", background: T.blue, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: busy || brief.trim().length < 20 ? 0.55 : 1 }}
        >
          {busy === "fill" ? "Drafting…" : "Smart fill"}
        </button>
      </div>

      {(filled || fields.quote || fields.value || fields.title) && (
        <div style={{ marginTop: 18, maxWidth: 720 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {TPL_LABEL[template]} · fields
          </div>
          {TPL_FIELDS[template].map(f => (
            <div key={f.key} style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{f.label}</div>
              {(f.rows ?? 1) > 1 ? (
                <textarea
                  value={fields[f.key]}
                  onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                  rows={f.rows}
                  style={{ marginTop: 4, width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
                />
              ) : (
                <input
                  value={fields[f.key]}
                  onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ marginTop: 4, width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "inherit" }}
                />
              )}
            </div>
          ))}

          {(
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>Image from the media library (optional)</div>
              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" style={seg(assetId === null)} onClick={() => setAssetId(null)}>None</button>
                {(assets ?? []).map(a => (
                  <button key={a.id} type="button" style={seg(assetId === a.id)} onClick={() => setAssetId(a.id)}>{a.label}</button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={busy !== null}
            onClick={render}
            style={{ marginTop: 16, padding: "10px 22px", borderRadius: 99, border: "none", background: T.green, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: busy ? 0.55 : 1 }}
          >
            {busy === "render" ? "Rendering…" : "Render card"}
          </button>
        </div>
      )}

      {note && (
        <div style={{ marginTop: 12, fontSize: 13.5, fontWeight: 600, color: note.kind === "ok" ? T.green : "#B4432E" }}>{note.text}</div>
      )}
      {preview && (
        <div style={{ marginTop: 12, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", maxWidth: 420 }}>
          <img src={preview} alt="Card preview" style={{ width: "100%", display: "block" }} />
        </div>
      )}
    </div>
  );
}
