/**
 * THE HUNTING LANES — one register, two surfaces (2026-08-03, Paul: "I don't
 * see Home Services in the chips nor landscape and hardscaping").
 *
 * The landing hunt board and the hero chips both read THIS array, so a lane
 * cannot exist on one and be missing from the other — the previous
 * hand-copied chip list is exactly how five lanes covered a fourteen-lane
 * practice. Lives in its own module because Landing imports YuliaIntake:
 * either file exporting it to the other is an import cycle.
 *
 * Thesis lines are QUALITATIVE by design (zero-hallucination law: a figure
 * needs a citation, and a hero teaser is no place to carry one). The two
 * 2026-08-03 additions are lanes the practice actively hunts and publishes
 * research on.
 *
 * NOTE: /industries presents fifteen sectors — adding the two new lanes
 * there needs full zig-zag thesis blocks (real copy, Paul's voice), flagged
 * as open work rather than improvised here.
 */
export interface HuntLane {
  nm: string;
  th: string;
}

export const HUNT_LANES: HuntLane[] = [
  { nm: 'Home services', th: 'Need-based work in the home — recurring, fragmented, succession-heavy, and rarely brokered.' },
  { nm: 'Landscaping & hardscaping', th: 'Commercial grounds contracts renew season after season; route density is the moat.' },
  { nm: 'Fire & life safety', th: 'NFPA 25 and 72 make inspection the law — every install becomes an annuity.' },
  { nm: 'Elevator & escalator service', th: 'Mandated inspections, sticky contract books, light capex, aging owners.' },
  { nm: 'Power & grid infrastructure services', th: 'Transformer refurb, substations, certified testing — the layer electrification runs on.' },
  { nm: 'Building automation & critical power', th: 'Controls, commissioning, cooling and backup power — recurring service where downtime isn’t an option.' },
  { nm: 'Energy-adjacent services & distribution', th: 'The electrification wave at operating-company scale — services, contracting and distribution; never minerals or generation.' },
  { nm: 'Testing, inspection & certification / NDT', th: 'Demand written into code, behind a certification moat — and succession in almost every shop.' },
  { nm: 'Environmental & industrial cleaning', th: 'Permit-gated, regulation-driven, and rarely brokered.' },
  { nm: 'Water & wastewater contract O&M', th: 'Multi-year municipal contracts — the most durable revenue in the services economy.' },
  { nm: 'Specialty & MRO distribution', th: 'Vendor authorizations and VMI programs that underwrite like contracts.' },
  { nm: 'Machine shops & precision manufacturing', th: 'AS9100 and ISO 13485 qualification cycles make revenue stick; reshoring is the tailwind.' },
  { nm: 'Food contract manufacturing & co-packing', th: 'Multi-year supply agreements, with real density in our backyard.' },
  { nm: 'Non-emergency medical transport', th: 'Recurring, reimbursement-funded trips — underwritten with eyes open.' },
  { nm: 'Revenue cycle management & medical billing', th: 'Fragmented and clean to diligence — we underwrite the niche before the number.' },
];

/** The DESKTOP hero shows a FEATURED row, not the whole board (Paul: "is
 *  there a better way to present rather than just a cloud of chat pills?").
 *  Six lanes + an "All lanes →" chip that jumps to the hunt board, where
 *  every lane sits with its thesis. Derived by name from the register so a
 *  renamed lane breaks the build here rather than silently vanishing. */
const FEATURED_NAMES = [
  'Home services',
  'Landscaping & hardscaping',
  'Fire & life safety',
  'Elevator & escalator service',
  'Water & wastewater contract O&M',
  'Specialty & MRO distribution',
];
export const FEATURED_LANES: string[] = FEATURED_NAMES.map(n => {
  const hit = HUNT_LANES.find(l => l.nm === n);
  if (!hit) throw new Error(`Featured lane not in HUNT_LANES: ${n}`);
  return hit.nm;
});
