/**
 * Sector art (2026-07-20) — Paul: "find visuals that represent the industries
 * and verticals we talk about."
 *
 * A library of hand-drawn editorial LINE-ART illustrations, one per vertical
 * the practice hunts (the landing hunt board + the common adjacent lanes),
 * keyword-matched from a run's topic/title. Deterministic, always available,
 * always on-brand: ink strokes, one Deal-Green accent, one brass detail —
 * the recognizable OBJECT of the trade, not abstract geometry.
 *
 * Every illustration is drawn in a 400×400 viewBox with a common grammar:
 * consistent 6px stroke, rounded caps, a ground line near y=352, the subject
 * centered. `sectorArtSvg()` returns the inline SVG; callers compose it over
 * the light paper texture (cover art panels) or at low opacity (page echoes).
 */

const INK = '#14181C';
const GREEN = '#16624C';
const GREEN_SOFT = 'rgba(22,98,76,0.10)';
const BRASS = '#B08637';

const S = `fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const SG = `fill="none" stroke="${GREEN}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const SB = `fill="none" stroke="${BRASS}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const GROUND = `<line x1="28" y1="352" x2="372" y2="352" ${S} stroke-width="5"/>`;

/** The drawings. Keys are stable; matcher below maps text → key. */
const ART: Record<string, string> = {
  // Fire & life safety — extinguisher with gauge + hose.
  fire_safety: `
    <rect x="150" y="120" width="84" height="200" rx="30" ${S} fill="${GREEN_SOFT}"/>
    <line x1="150" y1="168" x2="234" y2="168" ${SB}/>
    <circle cx="192" cy="104" r="16" ${SG}/>
    <path d="M176 96 L176 74 L216 74" ${S}/>
    <path d="M176 84 L212 84" ${S}/>
    <path d="M150 200 Q96 210 96 268 L96 300" ${S}/>
    <path d="M84 300 L108 300 L108 322 L84 322 Z" ${S}/>
    ${GROUND}`,
  // Elevator & escalator — cab with split doors in a shaft, pulley above.
  elevator: `
    <rect x="122" y="96" width="156" height="256" ${S}/>
    <circle cx="200" cy="64" r="18" ${SB}/>
    <line x1="200" y1="82" x2="200" y2="128" ${S} stroke-width="4"/>
    <rect x="146" y="128" width="108" height="188" rx="8" ${S}/>
    <line x1="200" y1="128" x2="200" y2="316" ${SG}/>
    <rect x="158" y="140" width="34" height="164" ${SG} stroke-width="4" fill="${GREEN_SOFT}"/>
    <rect x="208" y="140" width="34" height="164" ${SG} stroke-width="4" fill="${GREEN_SOFT}"/>
    <path d="M304 168 L304 128 L328 148 Z" fill="${BRASS}" stroke="none"/>
    <path d="M304 232 L304 272 L328 252 Z" fill="${INK}" stroke="none"/>
    ${GROUND}`,
  // Power & grid — transmission tower + lines.
  power_grid: `
    <path d="M160 352 L188 96 L212 96 L240 352" ${S}/>
    <line x1="146" y1="170" x2="254" y2="170" ${S}/>
    <line x1="132" y1="238" x2="268" y2="238" ${S}/>
    <line x1="172" y1="170" x2="228" y2="238" ${S} stroke-width="4"/>
    <line x1="228" y1="170" x2="172" y2="238" ${S} stroke-width="4"/>
    <path d="M28 150 Q100 186 146 170" ${SG} stroke-width="5"/>
    <path d="M254 170 Q300 186 372 150" ${SG} stroke-width="5"/>
    <circle cx="200" cy="82" r="10" ${SB}/>
    ${GROUND}`,
  // Building automation & critical power — control dial + slider panel.
  building_automation: `
    <rect x="96" y="96" width="208" height="224" rx="18" ${S}/>
    <circle cx="200" cy="176" r="52" ${S}/>
    <line x1="200" y1="176" x2="232" y2="144" ${SG}/>
    <circle cx="238" cy="138" r="8" fill="${BRASS}" stroke="none"/>
    <line x1="136" y1="264" x2="264" y2="264" ${S} stroke-width="4"/>
    <circle cx="168" cy="264" r="10" ${SG}/>
    <line x1="136" y1="292" x2="264" y2="292" ${S} stroke-width="4"/>
    <circle cx="228" cy="292" r="10" ${SG}/>
    ${GROUND}`,
  // Testing / inspection / NDT — magnifier over a weld seam.
  tic_ndt: `
    <rect x="60" y="240" width="280" height="60" rx="8" ${S}/>
    <path d="M60 270 Q90 254 120 270 Q150 286 180 270 Q210 254 240 270 Q270 286 300 270 Q320 260 340 270" ${SB} stroke-width="5"/>
    <circle cx="196" cy="170" r="64" ${S} fill="rgba(246,244,239,0.85)"/>
    <line x1="242" y1="216" x2="292" y2="266" ${S} stroke-width="10"/>
    <path d="M168 172 L188 192 L228 148" ${SG}/>
    ${GROUND}`,
  // Environmental & industrial cleaning — drum + spray wand.
  env_cleaning: `
    <rect x="118" y="150" width="120" height="170" rx="12" ${S}/>
    <line x1="118" y1="192" x2="238" y2="192" ${SB}/>
    <line x1="118" y1="278" x2="238" y2="278" ${S} stroke-width="4"/>
    <path d="M238 176 L300 130 L318 148" ${S}/>
    <path d="M322 132 L338 116" ${S} stroke-width="8"/>
    <circle cx="352" cy="96" r="6" fill="${GREEN}" stroke="none"/>
    <circle cx="366" cy="118" r="6" fill="${GREEN}" stroke="none"/>
    <circle cx="344" cy="140" r="6" fill="${GREEN}" stroke="none"/>
    ${GROUND}`,
  // Water & wastewater — water tower + valve pipe.
  water_wastewater: `
    <path d="M130 96 L270 96 L252 200 L148 200 Z" ${S} fill="${GREEN_SOFT}"/>
    <path d="M130 96 Q200 76 270 96" ${S}/>
    <line x1="148" y1="152" x2="252" y2="152" ${SG}/>
    <line x1="160" y1="200" x2="140" y2="352" ${S}/>
    <line x1="240" y1="200" x2="260" y2="352" ${S}/>
    <line x1="152" y1="264" x2="248" y2="264" ${S} stroke-width="4"/>
    <circle cx="200" cy="308" r="22" ${SB}/>
    <line x1="200" y1="286" x2="200" y2="330" ${SB} stroke-width="4"/>
    <line x1="178" y1="308" x2="222" y2="308" ${SB} stroke-width="4"/>
    ${GROUND}`,
  // Specialty & MRO distribution — warehouse racking with boxed bays.
  mro_distribution: `
    <line x1="92" y1="352" x2="92" y2="96" ${S}/>
    <line x1="308" y1="352" x2="308" y2="96" ${S}/>
    <line x1="92" y1="160" x2="308" y2="160" ${S}/>
    <line x1="92" y1="256" x2="308" y2="256" ${S}/>
    <rect x="116" y="110" width="52" height="50" ${S} stroke-width="4"/>
    <rect x="228" y="110" width="52" height="50" ${SG} stroke-width="4" fill="${GREEN_SOFT}"/>
    <rect x="116" y="206" width="52" height="50" ${SG} stroke-width="4" fill="${GREEN_SOFT}"/>
    <rect x="180" y="206" width="52" height="50" ${S} stroke-width="4"/>
    <rect x="180" y="302" width="52" height="50" ${S} stroke-width="4"/>
    <rect x="244" y="302" width="52" height="50" ${SB} stroke-width="4"/>
    ${GROUND}`,
  // Machine shops — gear + caliper.
  machine_shop: `
    <circle cx="172" cy="200" r="72" ${S}/>
    <circle cx="172" cy="200" r="26" ${SB}/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const r1 = 72, r2 = 92, x = 172, y = 200;
      const rad = (a * Math.PI) / 180;
      return `<line x1="${(x + r1 * Math.cos(rad)).toFixed(0)}" y1="${(y + r1 * Math.sin(rad)).toFixed(0)}" x2="${(x + r2 * Math.cos(rad)).toFixed(0)}" y2="${(y + r2 * Math.sin(rad)).toFixed(0)}" ${S}/>`;
    }).join('')}
    <path d="M278 176 L278 224 L360 224 L360 200 L316 200 L316 176 Z" ${SG} fill="${GREEN_SOFT}"/>
    <line x1="278" y1="248" x2="360" y2="248" ${SG} stroke-width="5"/>
    ${GROUND}`,
  // Food co-packing — conveyor with jars.
  food_copack: `
    <line x1="72" y1="290" x2="328" y2="290" ${S}/>
    <circle cx="104" cy="336" r="16" ${S}/>
    <circle cx="200" cy="336" r="16" ${S}/>
    <circle cx="296" cy="336" r="16" ${S}/>
    <circle cx="104" cy="336" r="5" fill="${BRASS}" stroke="none"/>
    <rect x="120" y="216" width="56" height="74" rx="8" ${S}/>
    <line x1="120" y1="232" x2="176" y2="232" ${SG}/>
    <rect x="224" y="216" width="56" height="74" rx="8" ${S} fill="${GREEN_SOFT}"/>
    <line x1="224" y1="232" x2="280" y2="232" ${SG}/>
    ${GROUND}`,
  // Non-emergency medical transport — van with cross.
  medical_transport: `
    <path d="M76 300 L76 210 L236 210 L236 300" ${S}/>
    <path d="M236 240 L302 240 L330 280 L330 300 L236 300" ${S}/>
    <rect x="252" y="252" width="40" height="26" rx="4" ${S} stroke-width="4"/>
    <circle cx="124" cy="328" r="24" ${S}/>
    <circle cx="288" cy="328" r="24" ${S}/>
    <circle cx="124" cy="328" r="8" fill="${BRASS}" stroke="none"/>
    <path d="M144 236 L168 236 M156 224 L156 248" ${SG} stroke-width="8"/>
    ${GROUND}`,
  // Revenue cycle / medical billing — invoice + green check + cross.
  rcm_billing: `
    <rect x="128" y="88" width="150" height="204" rx="10" ${S} fill="rgba(255,255,255,0.7)"/>
    <path d="M278 128 L312 128 L312 332 L162 332 L162 292" ${S} stroke-width="4"/>
    <line x1="152" y1="132" x2="222" y2="132" ${S} stroke-width="4"/>
    <line x1="152" y1="164" x2="254" y2="164" ${S} stroke-width="4"/>
    <line x1="152" y1="196" x2="254" y2="196" ${S} stroke-width="4"/>
    <path d="M152 240 L168 256 L200 224" ${SG}/>
    <path d="M236 240 L260 240 M248 228 L248 252" ${SB} stroke-width="6"/>
    ${GROUND}`,
  // HVAC — rooftop unit with fan.
  hvac: `
    <rect x="92" y="150" width="216" height="140" rx="14" ${S}/>
    <circle cx="160" cy="220" r="44" ${S}/>
    ${[0, 120, 240].map(a => {
      const rad = ((a - 90) * Math.PI) / 180;
      return `<path d="M160 220 Q ${(160 + 30 * Math.cos(rad + 0.5)).toFixed(0)} ${(220 + 30 * Math.sin(rad + 0.5)).toFixed(0)} ${(160 + 40 * Math.cos(rad)).toFixed(0)} ${(220 + 40 * Math.sin(rad)).toFixed(0)}" ${SG} stroke-width="5"/>`;
    }).join('')}
    <line x1="236" y1="180" x2="284" y2="180" ${SB} stroke-width="5"/>
    <line x1="236" y1="208" x2="284" y2="208" ${SB} stroke-width="5"/>
    <line x1="236" y1="236" x2="284" y2="236" ${SB} stroke-width="5"/>
    <line x1="128" y1="290" x2="128" y2="352" ${S}/>
    <line x1="272" y1="290" x2="272" y2="352" ${S}/>
    ${GROUND}`,
  // Plumbing — pipe run, valve wheel, drop.
  plumbing: `
    <path d="M60 180 L220 180 L220 300 L340 300" ${S} stroke-width="10"/>
    <line x1="60" y1="158" x2="60" y2="202" ${S} stroke-width="8"/>
    <line x1="340" y1="278" x2="340" y2="322" ${S} stroke-width="8"/>
    <circle cx="220" cy="180" r="30" ${SB}/>
    <line x1="220" y1="150" x2="220" y2="210" ${SB} stroke-width="5"/>
    <line x1="190" y1="180" x2="250" y2="180" ${SB} stroke-width="5"/>
    <path d="M290 236 q14 20 0 32 q-14 -12 0 -32" ${SG} fill="${GREEN_SOFT}"/>
    ${GROUND}`,
  // Electrical — breaker panel + bolt.
  electrical: `
    <rect x="110" y="92" width="180" height="228" rx="14" ${S}/>
    <path d="M214 128 L172 208 L200 208 L182 276 L232 184 L204 184 Z" ${SG} fill="${GREEN_SOFT}"/>
    <circle cx="132" cy="114" r="5" fill="${BRASS}" stroke="none"/>
    <circle cx="268" cy="114" r="5" fill="${BRASS}" stroke="none"/>
    <circle cx="132" cy="298" r="5" fill="${BRASS}" stroke="none"/>
    <circle cx="268" cy="298" r="5" fill="${BRASS}" stroke="none"/>
    ${GROUND}`,
  // Landscaping — push mower (left, handle back-left) + tree (right).
  landscaping: `
    <rect x="112" y="264" width="120" height="52" rx="10" ${S}/>
    <path d="M112 276 L64 212 L48 220" ${S}/>
    <circle cx="140" cy="330" r="22" ${S}/>
    <circle cx="216" cy="334" r="18" ${S}/>
    <circle cx="140" cy="330" r="7" fill="${BRASS}" stroke="none"/>
    <line x1="124" y1="290" x2="220" y2="290" ${SB} stroke-width="4"/>
    <circle cx="312" cy="180" r="52" ${SG} fill="${GREEN_SOFT}"/>
    <line x1="312" y1="232" x2="312" y2="352" ${S}/>
    <line x1="312" y1="286" x2="286" y2="260" ${S} stroke-width="4"/>
    ${GROUND}`,
  // Roofing — gable, courses, ladder.
  roofing: `
    <path d="M80 220 L200 110 L320 220" ${S}/>
    <path d="M108 194 L292 194" ${SB} stroke-width="4"/>
    <path d="M136 168 L264 168" ${SB} stroke-width="4"/>
    <path d="M164 142 L236 142" ${SB} stroke-width="4"/>
    <line x1="110" y1="220" x2="110" y2="352" ${S}/>
    <line x1="290" y1="220" x2="290" y2="352" ${S}/>
    <line x1="330" y1="352" x2="368" y2="196" ${SG} stroke-width="5"/>
    <line x1="306" y1="352" x2="344" y2="196" ${SG} stroke-width="5"/>
    <line x1="322" y1="300" x2="352" y2="300" ${SG} stroke-width="5"/>
    <line x1="332" y1="256" x2="362" y2="256" ${SG} stroke-width="5"/>
    ${GROUND}`,
  // Logistics — semi truck.
  logistics: `
    <rect x="64" y="160" width="180" height="130" rx="8" ${S}/>
    <path d="M244 200 L300 200 L332 244 L332 290 L244 290" ${S}/>
    <rect x="256" y="212" width="36" height="28" rx="4" ${S} stroke-width="4"/>
    <circle cx="112" cy="328" r="24" ${S}/>
    <circle cx="196" cy="328" r="24" ${S}/>
    <circle cx="296" cy="328" r="24" ${S}/>
    <circle cx="296" cy="328" r="8" fill="${BRASS}" stroke="none"/>
    <line x1="80" y1="200" x2="228" y2="200" ${SG} stroke-width="5"/>
    ${GROUND}`,
  // IT services / MSP — server rack.
  it_msp: `
    <rect x="130" y="84" width="140" height="236" rx="12" ${S}/>
    <line x1="130" y1="144" x2="270" y2="144" ${S} stroke-width="4"/>
    <line x1="130" y1="204" x2="270" y2="204" ${S} stroke-width="4"/>
    <line x1="130" y1="264" x2="270" y2="264" ${S} stroke-width="4"/>
    <circle cx="156" cy="114" r="7" fill="${GREEN}" stroke="none"/>
    <circle cx="156" cy="174" r="7" fill="${GREEN}" stroke="none"/>
    <circle cx="156" cy="234" r="7" fill="${GREEN}" stroke="none"/>
    <line x1="196" y1="114" x2="246" y2="114" ${SB} stroke-width="5"/>
    <line x1="196" y1="174" x2="246" y2="174" ${SB} stroke-width="5"/>
    <line x1="196" y1="234" x2="246" y2="234" ${SB} stroke-width="5"/>
    <path d="M200 320 L200 352" ${S}/>
    ${GROUND}`,
  // Medical clinics / healthcare services — storefront with cross.
  medical_clinic: `
    <rect x="92" y="170" width="216" height="182" ${S}/>
    <path d="M76 170 L200 108 L324 170" ${S}/>
    <rect x="172" y="252" width="56" height="100" ${S} stroke-width="4"/>
    <rect x="112" y="200" width="48" height="40" ${S} stroke-width="4"/>
    <rect x="240" y="200" width="48" height="40" ${S} stroke-width="4"/>
    <path d="M186 148 L214 148 M200 134 L200 162" ${SG} stroke-width="8"/>
    <circle cx="216" cy="300" r="4" fill="${BRASS}" stroke="none"/>
    ${GROUND}`,
  // Default — the deal skyline: buildings + crane (any unmatched lane).
  default_building: `
    <rect x="72" y="180" width="80" height="172" ${S}/>
    <rect x="168" y="130" width="90" height="222" ${S}/>
    <rect x="274" y="212" width="66" height="140" ${S}/>
    ${[0, 1, 2].map(r => [0, 1].map(c => `<rect x="${86 + c * 30}" y="${198 + r * 44}" width="18" height="22" ${SG} stroke-width="4"/>`).join('')).join('')}
    ${[0, 1, 2, 3].map(r => [0, 1].map(c => `<rect x="${184 + c * 34}" y="${148 + r * 46}" width="20" height="24" ${S} stroke-width="4"/>`).join('')).join('')}
    <line x1="304" y1="212" x2="304" y2="96" ${SB} stroke-width="5"/>
    <line x1="304" y1="96" x2="220" y2="96" ${SB} stroke-width="5"/>
    <line x1="236" y1="96" x2="236" y2="118" ${SB} stroke-width="4"/>
    ${GROUND}`,
};

/** Keyword → sector key. First match wins; order matters (specific first). */
const MATCHERS: Array<[RegExp, string]> = [
  [/fire|life safety|nfpa|sprinkler|alarm/i, 'fire_safety'],
  [/elevator|escalator|lift service|vertical transport/i, 'elevator'],
  [/grid|transformer|substation|transmission|utility infra|power line|electrification/i, 'power_grid'],
  [/building automation|controls|bms|critical power|ups|backup power|data center cooling|commissioning/i, 'building_automation'],
  [/\bndt\b|nondestructive|non-destructive|testing.{0,12}inspection|inspection.{0,12}certification|\btic\b|weld test/i, 'tic_ndt'],
  [/environmental|industrial cleaning|hazmat|remediation|abatement|waste service/i, 'env_cleaning'],
  [/water|wastewater|utility o&m|municipal contract/i, 'water_wastewater'],
  [/\bmro\b|distribution|distributor|vmi|supply house/i, 'mro_distribution'],
  [/machine shop|machining|cnc|precision manufactur|aerospace part|as9100/i, 'machine_shop'],
  [/co-?pack|food manufactur|food contract|beverage manufactur|bottling/i, 'food_copack'],
  [/medical transport|nemt|ambulance|patient transport/i, 'medical_transport'],
  [/revenue cycle|medical billing|\brcm\b|claims processing/i, 'rcm_billing'],
  [/hvac|heating|air condition|mechanical contractor|chiller/i, 'hvac'],
  [/plumb|drain|pipe service/i, 'plumbing'],
  [/electric(?!ification)|electrical contractor|low voltage/i, 'electrical'],
  [/landscap|lawn|grounds|tree care|irrigation/i, 'landscaping'],
  [/roof/i, 'roofing'],
  [/logistics|freight|trucking|3pl|last.?mile|carrier/i, 'logistics'],
  [/\bmsp\b|managed service|it services|software|saas|cybersecurity/i, 'it_msp'],
  [/dental|clinic|med spa|veterinar|physical therapy|home health|healthcare services|behavioral health/i, 'medical_clinic'],
];

export function sectorKeyFor(text: string): string {
  const t = String(text ?? '');
  for (const [re, key] of MATCHERS) if (re.test(t)) return key;
  return 'default_building';
}

export const SECTOR_KEYS = Object.keys(ART);

/** Inline SVG for the sector matched from `text`, scaled to w×h (contain). */
export function sectorArtSvg(text: string, w: number, h: number): { key: string; svg: string } {
  const key = sectorKeyFor(text);
  const body = ART[key] ?? ART.default_building;
  return { key, svg: `<svg width="${w}" height="${h}" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${body}</svg>` };
}

/** A specific drawing by key (contact sheets, future pickers). */
export function sectorArtByKey(key: string, w: number, h: number): string {
  const body = ART[key] ?? ART.default_building;
  return `<svg width="${w}" height="${h}" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}
