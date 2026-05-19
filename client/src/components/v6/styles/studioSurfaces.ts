import type { CSSProperties } from "react";
import { ART_HOUSE_TEXTURES, STUDIO_TEXTURES } from "../../../lib/randomTextures";
import type { StudioFormatId } from "../types";

export const studioFormatTextures: Record<StudioFormatId, string> = {
  "buyer-pitch-book": STUDIO_TEXTURES.green,
  "seller-pitch-book": STUDIO_TEXTURES.rose,
  "ic-deck": STUDIO_TEXTURES.navy,
  "qoe-preview-book": STUDIO_TEXTURES.blue,
  "cim-summary-deck": ART_HOUSE_TEXTURES.studioPreview,
  "board-update": ART_HOUSE_TEXTURES.studioCampaign,
  "lender-book": ART_HOUSE_TEXTURES.studioCollateral,
};

export const studioGlassBackdrop: CSSProperties = {
  backdropFilter: "blur(22px) saturate(155%)",
  WebkitBackdropFilter: "blur(22px) saturate(155%)",
};

export const studioLiquidGlass =
  "radial-gradient(circle at 18% 0%, rgba(255,255,255,.54), transparent 36%), " +
  "linear-gradient(135deg, rgba(255,255,255,.58), rgba(245,250,255,.32) 50%, rgba(232,241,252,.20))";

export const studioLiquidGlassFilter = "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)";

export const studioLiquidGlassShadow =
  "0 16px 34px -22px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.44), inset 0 -1px 0 rgba(255,255,255,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.34)";

export const studioLiquidDarkGlassShadow =
  "0 16px 34px -22px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.34), inset 0 -1px 0 rgba(255,255,255,0.08), inset 0 0 0 0.5px rgba(255,255,255,0.26)";

export const studioHeroWash =
  `linear-gradient(155deg, rgba(77,39,53,0.52) 0%, rgba(183,103,93,0.34) 48%, rgba(29,30,54,0.58) 100%), url('${STUDIO_TEXTURES.rose}')`;

export function studioFormatCardBackground(value: StudioFormatId): string {
  return `linear-gradient(180deg, rgba(14, 31, 50, 0.16), rgba(12, 28, 48, 0.62)), linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,0) 48%), url('${studioFormatTextures[value]}')`;
}

export const studioTextureCardStyles: Record<string, CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  card: {
    minHeight: 220,
    position: "relative",
    textAlign: "left",
    borderRadius: 18,
    padding: 17,
    border: "1px solid rgba(255,255,255,.28)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#FFFFFF",
    boxShadow: "0 18px 44px rgba(42,65,96,.14), inset 0 1px 0 rgba(255,255,255,.28)",
    ...studioGlassBackdrop,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflow: "hidden",
  },
  active: {
    borderColor: "rgba(255,255,255,.82)",
    boxShadow: "0 22px 52px rgba(46,92,138,.24), inset 0 0 0 1px rgba(255,255,255,.42)",
  },
  meta: { color: "rgba(255,255,255,.74)", fontWeight: 850, fontSize: 12 },
  title: { fontSize: 19, lineHeight: 1.05 },
  audience: { color: "rgba(255,255,255,.86)", fontWeight: 850, fontSize: 12 },
  detail: { color: "rgba(236,246,255,.90)", fontSize: 13, lineHeight: 1.35, marginTop: "auto" },
  action: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    padding: "7px 12px",
    background: "rgba(26,34,51,.46)",
    border: "1px solid rgba(255,255,255,.24)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 850,
    boxShadow: studioLiquidDarkGlassShadow,
    backdropFilter: studioLiquidGlassFilter,
    WebkitBackdropFilter: studioLiquidGlassFilter,
  },
};

export const studioListCardStyles: Record<string, CSSProperties> = {
  panel: {
    borderRadius: 24,
    padding: 20,
    background: studioLiquidGlass,
    border: "1px solid rgba(255,255,255,.55)",
    boxShadow: "0 18px 44px rgba(42,65,96,.10), inset 0 1px 0 rgba(255,255,255,.72)",
    ...studioGlassBackdrop,
  },
  stack: { display: "grid", gap: 10, marginTop: 18 },
  row: {
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: 12,
    borderRadius: 18,
    background: "rgba(247,250,255,.82)",
    border: "1px solid rgba(153,176,209,.32)",
    textAlign: "left",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 900,
    background: "linear-gradient(135deg, #8A9AE8, #2E5C8A)",
  },
  body: { display: "grid", gap: 3, minWidth: 0 },
  cleanPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(111,174,149,.16)",
    color: "#2F735D",
    fontWeight: 900,
    fontSize: 12,
  },
  warnPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(201,162,78,.17)",
    color: "#8B6422",
    fontWeight: 900,
    fontSize: 12,
  },
};

export const studioCompeteCardStyles: Record<string, CSSProperties> = {
  panel: {
    borderRadius: 24,
    padding: 22,
    backgroundImage: `radial-gradient(circle at 10% 0%, rgba(255,255,255,.58), transparent 38%), linear-gradient(135deg, rgba(255,255,255,.74), rgba(238,245,255,.44)), url('${STUDIO_TEXTURES.blue}')`,
    backgroundSize: "cover",
    border: "1px solid rgba(255,255,255,.55)",
    boxShadow: "0 18px 44px rgba(42,65,96,.10), inset 0 1px 0 rgba(255,255,255,.72)",
    ...studioGlassBackdrop,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
    gap: 12,
    marginTop: 20,
  },
  item: {
    minHeight: 118,
    borderRadius: 18,
    padding: 14,
    background: "rgba(255,255,255,.68)",
    border: "1px solid rgba(153,176,209,.36)",
    display: "grid",
    gap: 8,
    alignContent: "start",
    color: "#60708A",
  },
};
