/* V6 Mobile — Industry-aware icon for deal rows.
   Replaces the Y icon block (which was conceptually wrong — Yulia
   isn't the deal owner) with a small glyph that infers the industry
   from the deal name. Same colored-circle treatment as the previous
   Y icon so the rows still get vivid color punctuation, but the
   icon now communicates *what kind of business* this row is, not
   "this row belongs to Yulia." */

import {
  Bug, Zap, Wind, Shirt, Smile, TreeDeciduous, Wrench, Truck,
  Anchor, Package, Hammer, Droplet, Shield, Waves, CloudRain,
  Key, Home, Brush, Building2, Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { Verdict } from "./types";

interface IndustryIconProps {
  /** Deal name. Used to infer the industry glyph. */
  name: string;
  /** Verdict drives the background tint (pursue/watch/pass colors). */
  verdict?: Verdict;
  size?: number;
  radius?: number;
}

/* Each entry is [keyword (case-insensitive substring), icon].
   First match wins, so order matters — more-specific keywords first.
   Keep this list maintained with the sample data; unknown names
   fall back to Briefcase. */
const INDUSTRY_RULES: Array<[RegExp, LucideIcon]> = [
  [/pest/i,                    Bug],
  [/electric/i,                Zap],
  [/hvac/i,                    Wind],
  [/laundry/i,                 Shirt],
  [/dental/i,                  Smile],
  [/landscap/i,                TreeDeciduous],
  [/metal\s*fab|fabrication/i, Wrench],
  [/distribut/i,               Truck],
  [/marina|boat|ship/i,        Anchor],
  [/logistic|shipping/i,       Package],
  [/tile|stone|mason/i,        Hammer],
  [/irrigat/i,                 Droplet],
  [/fenc/i,                    Shield],
  [/pool/i,                    Waves],
  [/gutter|roof/i,             CloudRain],
  [/locksmith|lock/i,          Key],
  [/roofing/i,                 Home],
  [/plumb/i,                   Droplet],
  [/floor/i,                   Hammer],
  [/paint/i,                   Brush],
  [/big fake|fake deal/i,      Building2],
];

function pickIcon(name: string): LucideIcon {
  for (const [pattern, icon] of INDUSTRY_RULES) {
    if (pattern.test(name)) return icon;
  }
  return Briefcase;
}

const VERDICT_BG: Record<Verdict, [string, string]> = {
  pursue: ["#B5DCC5", "#3F8A6A"],   // green gradient
  watch:  ["#F0CF98", "#B8853F"],   // amber gradient
  pass:   ["#F0BAB3", "#A85248"],   // muted red gradient
};

export function IndustryIcon({
  name, verdict = "pursue", size = 40, radius,
}: IndustryIconProps) {
  const Icon = pickIcon(name);
  const r = radius ?? size * 0.27; // ~27% radius (continuous-ish corner feel)
  const [c1, c2] = VERDICT_BG[verdict] ?? VERDICT_BG.pursue;
  const iconSize = Math.round(size * 0.5);
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        flexShrink: 0,
        boxShadow: [
          "0 0 0 0.5px rgba(0,0,0,0.06)",
          "0 1px 2px rgba(0,0,0,0.10)",
          "inset 0 1px 0 rgba(255,255,255,0.32)",
          "inset 0 0 0 0.5px rgba(255,255,255,0.14)",
        ].join(","),
      }}
    >
      <Icon size={iconSize} strokeWidth={2.2} />
    </div>
  );
}
